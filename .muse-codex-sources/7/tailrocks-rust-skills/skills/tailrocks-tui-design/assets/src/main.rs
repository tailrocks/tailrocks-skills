//! Gallery preview and atomic golden publisher.
//!
//! Exact grammar:
//!   --list
//!   --screen <name> --state <state>
//!   --screen <name> --state <state> --size <WxH>
//!   --write
//!
//! `--write` is legitimate only during authorized design iteration or after
//! exact user re-blessing. It stages and swaps the complete golden directory;
//! it never overwrites frames one by one.

use std::collections::BTreeMap;
use std::ffi::OsString;
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

use app_gallery::{registry, render_text};

const MAX_FRAME_BYTES: usize = 500_000;
const MAX_GOLDEN_BYTES: usize = 64 * 1024 * 1024;
const MAX_GOLDEN_FILES: usize = 4_096;

enum Command {
    List,
    Preview {
        screen: String,
        state: String,
        size: Option<(u16, u16)>,
    },
    Write,
}

enum PublishError {
    Refused(&'static str),
    RecoveryRequired(Vec<PathBuf>),
}

fn refuse(code: &str) -> ! {
    println!(
        "{{\"schema\":\"tailrocks.tui-gallery/v1\",\"outcome\":\"refused\",\"code\":\"{code}\",\"mutations\":[]}}"
    );
    std::process::exit(2);
}

fn recovery(paths: &[PathBuf]) -> ! {
    let artifacts = paths
        .iter()
        .map(|path| format!("\"{}\"", json_escape(&path.display().to_string())))
        .collect::<Vec<_>>()
        .join(",");
    println!(
        "{{\"schema\":\"tailrocks.tui-gallery/v1\",\"outcome\":\"recovery_required\",\"code\":\"publication_incomplete\",\"recovery_artifacts\":[{artifacts}]}}"
    );
    std::process::exit(3);
}

fn json_escape(value: &str) -> String {
    value
        .chars()
        .flat_map(|ch| match ch {
            '"' => "\\\"".chars().collect::<Vec<_>>(),
            '\\' => "\\\\".chars().collect(),
            '\n' => "\\n".chars().collect(),
            '\r' => "\\r".chars().collect(),
            '\t' => "\\t".chars().collect(),
            ch if ch.is_control() => "?".chars().collect(),
            ch => vec![ch],
        })
        .collect()
}

fn parse_size(value: &str) -> Option<(u16, u16)> {
    let (width, height) = value.split_once('x')?;
    if width.is_empty()
        || height.is_empty()
        || !width.bytes().all(|byte| byte.is_ascii_digit())
        || !height.bytes().all(|byte| byte.is_ascii_digit())
    {
        return None;
    }
    Some((width.parse().ok()?, height.parse().ok()?))
}

fn parse_args(args: Vec<String>) -> Option<Command> {
    match args.as_slice() {
        [flag] if flag == "--list" => Some(Command::List),
        [flag] if flag == "--write" => Some(Command::Write),
        [screen_flag, screen, state_flag, state]
            if screen_flag == "--screen" && state_flag == "--state" =>
        {
            Some(Command::Preview {
                screen: screen.clone(),
                state: state.clone(),
                size: None,
            })
        }
        [screen_flag, screen, state_flag, state, size_flag, size]
            if screen_flag == "--screen" && state_flag == "--state" && size_flag == "--size" =>
        {
            Some(Command::Preview {
                screen: screen.clone(),
                state: state.clone(),
                size: Some(parse_size(size)?),
            })
        }
        _ => None,
    }
}

fn snapshot(directory: &Path) -> Result<BTreeMap<OsString, Vec<u8>>, &'static str> {
    match fs::symlink_metadata(directory) {
        Ok(metadata) if metadata.file_type().is_symlink() || !metadata.is_dir() => {
            return Err("unsafe_golden_path");
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(BTreeMap::new()),
        Err(_) => return Err("golden_metadata_failed"),
        _ => {}
    }
    let mut files = BTreeMap::new();
    let mut bytes = 0usize;
    for item in fs::read_dir(directory).map_err(|_| "golden_read_failed")? {
        if files.len() >= MAX_GOLDEN_FILES {
            return Err("golden_files_unbounded");
        }
        let item = item.map_err(|_| "golden_read_failed")?;
        let metadata = item.file_type().map_err(|_| "golden_metadata_failed")?;
        if !metadata.is_file() || metadata.is_symlink() {
            return Err("unexpected_golden_entry");
        }
        let content = fs::read(item.path()).map_err(|_| "golden_read_failed")?;
        bytes = bytes
            .checked_add(content.len())
            .ok_or("golden_bytes_unbounded")?;
        if bytes > MAX_GOLDEN_BYTES || files.insert(item.file_name(), content).is_some() {
            return Err("golden_bytes_unbounded");
        }
    }
    Ok(files)
}

#[cfg(unix)]
type DirectoryIdentity = (u64, u64);

#[cfg(unix)]
fn directory_identity(path: &Path) -> Result<DirectoryIdentity, &'static str> {
    use std::os::unix::fs::MetadataExt;
    let metadata = fs::metadata(path).map_err(|_| "root_metadata_failed")?;
    Ok((metadata.dev(), metadata.ino()))
}

#[cfg(not(unix))]
type DirectoryIdentity = PathBuf;

#[cfg(not(unix))]
fn directory_identity(path: &Path) -> Result<DirectoryIdentity, &'static str> {
    path.canonicalize().map_err(|_| "root_metadata_failed")
}

#[cfg(target_os = "linux")]
fn rename_no_replace(source: &Path, destination: &Path) -> Result<(), &'static str> {
    use std::ffi::CString;
    use std::os::raw::{c_char, c_int, c_uint};
    use std::os::unix::ffi::OsStrExt;
    unsafe extern "C" {
        fn renameat2(
            olddirfd: c_int,
            oldpath: *const c_char,
            newdirfd: c_int,
            newpath: *const c_char,
            flags: c_uint,
        ) -> c_int;
    }
    const AT_FDCWD: c_int = -100;
    const RENAME_NOREPLACE: c_uint = 1;
    let source = CString::new(source.as_os_str().as_bytes()).map_err(|_| "invalid_path")?;
    let destination =
        CString::new(destination.as_os_str().as_bytes()).map_err(|_| "invalid_path")?;
    let result = unsafe {
        renameat2(
            AT_FDCWD,
            source.as_ptr(),
            AT_FDCWD,
            destination.as_ptr(),
            RENAME_NOREPLACE,
        )
    };
    if result == 0 {
        Ok(())
    } else {
        Err("exclusive_rename_failed")
    }
}

#[cfg(target_os = "macos")]
fn rename_no_replace(source: &Path, destination: &Path) -> Result<(), &'static str> {
    use std::ffi::CString;
    use std::os::raw::{c_char, c_int, c_uint};
    use std::os::unix::ffi::OsStrExt;
    unsafe extern "C" {
        fn renamex_np(old: *const c_char, new: *const c_char, flags: c_uint) -> c_int;
    }
    const RENAME_EXCL: c_uint = 0x0000_0004;
    let source = CString::new(source.as_os_str().as_bytes()).map_err(|_| "invalid_path")?;
    let destination =
        CString::new(destination.as_os_str().as_bytes()).map_err(|_| "invalid_path")?;
    let result = unsafe { renamex_np(source.as_ptr(), destination.as_ptr(), RENAME_EXCL) };
    if result == 0 {
        Ok(())
    } else {
        Err("exclusive_rename_failed")
    }
}

#[cfg(target_os = "windows")]
fn rename_no_replace(source: &Path, destination: &Path) -> Result<(), &'static str> {
    use std::os::windows::ffi::OsStrExt;
    #[link(name = "Kernel32")]
    unsafe extern "system" {
        fn MoveFileExW(existing: *const u16, new: *const u16, flags: u32) -> i32;
    }
    let source = source
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect::<Vec<_>>();
    let destination = destination
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect::<Vec<_>>();
    let result = unsafe { MoveFileExW(source.as_ptr(), destination.as_ptr(), 0) };
    if result != 0 {
        Ok(())
    } else {
        Err("exclusive_rename_failed")
    }
}

#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn rename_no_replace(_: &Path, _: &Path) -> Result<(), &'static str> {
    Err("exclusive_rename_unsupported")
}

fn remove_owned_directory(
    path: &Path,
    expected_identity: &DirectoryIdentity,
    expected: &BTreeMap<OsString, Vec<u8>>,
) -> Result<(), PublishError> {
    let parent = path
        .parent()
        .ok_or_else(|| PublishError::RecoveryRequired(vec![path.to_path_buf()]))?;
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|_| PublishError::RecoveryRequired(vec![path.to_path_buf()]))?
        .as_nanos();
    let mut quarantine = None;
    for attempt in 0..32_u8 {
        let candidate = parent.join(format!(
            ".golden-cleanup-{}-{nonce}-{attempt}",
            std::process::id()
        ));
        if rename_no_replace(path, &candidate).is_ok() {
            quarantine = Some(candidate);
            break;
        }
    }
    let quarantine =
        quarantine.ok_or_else(|| PublishError::RecoveryRequired(vec![path.to_path_buf()]))?;
    if directory_identity(&quarantine).as_ref() != Ok(expected_identity)
        || snapshot(&quarantine).as_ref() != Ok(expected)
    {
        return Err(PublishError::RecoveryRequired(vec![quarantine]));
    }
    fs::remove_dir_all(&quarantine).map_err(|_| PublishError::RecoveryRequired(vec![quarantine]))
}

fn publish_goldens(entries: &[registry::Entry]) -> Result<usize, PublishError> {
    registry::validate(entries).map_err(|_| PublishError::Refused("invalid_registry"))?;
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .canonicalize()
        .map_err(|_| PublishError::Refused("invalid_root"))?;
    let root_identity = directory_identity(&root).map_err(PublishError::Refused)?;
    let golden = root.join("golden");
    let old_exists = fs::symlink_metadata(&golden).is_ok();
    let old = snapshot(&golden).map_err(PublishError::Refused)?;
    let old_identity = if old_exists {
        Some(directory_identity(&golden).map_err(PublishError::Refused)?)
    } else {
        None
    };
    let suffix = std::process::id();
    let stage = root.join(format!(".golden-stage-{suffix}"));
    let backup = root.join(format!(".golden-backup-{suffix}"));
    if fs::symlink_metadata(&stage).is_ok() || fs::symlink_metadata(&backup).is_ok() {
        return Err(PublishError::Refused("recovery_artifact_exists"));
    }
    fs::create_dir(&stage).map_err(|_| PublishError::Refused("stage_create_failed"))?;
    let stage_identity = directory_identity(&stage).map_err(PublishError::Refused)?;

    let mut expected_stage = BTreeMap::new();
    for entry in entries {
        let rendered = render_text(entry);
        if render_text(entry) != rendered {
            return Err(PublishError::RecoveryRequired(vec![stage]));
        }
        if rendered.len() > MAX_FRAME_BYTES || !rendered.ends_with('\n') {
            return Err(PublishError::RecoveryRequired(vec![stage]));
        }
        let target = stage.join(entry.golden_name());
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&target)
            .map_err(|_| PublishError::RecoveryRequired(vec![stage.clone()]))?;
        file.write_all(rendered.as_bytes())
            .and_then(|_| file.sync_all())
            .map_err(|_| PublishError::RecoveryRequired(vec![stage.clone()]))?;
        expected_stage.insert(OsString::from(entry.golden_name()), rendered.into_bytes());
    }
    File::open(&stage)
        .and_then(|directory| directory.sync_all())
        .map_err(|_| PublishError::RecoveryRequired(vec![stage.clone()]))?;

    let proof = directory_identity(&root)
        .and_then(|identity| {
            if identity == root_identity {
                Ok(())
            } else {
                Err("root_identity_changed")
            }
        })
        .and_then(|()| snapshot(&golden).map(|current| current == old))
        .and_then(|old_matches| {
            if old_matches {
                Ok(())
            } else {
                Err("concurrent_replacement")
            }
        })
        .and_then(|()| snapshot(&stage).map(|current| current == expected_stage))
        .and_then(|stage_matches| {
            if stage_matches {
                Ok(())
            } else {
                Err("staged_bytes_changed")
            }
        });
    if let Err(code) = proof {
        remove_owned_directory(&stage, &stage_identity, &expected_stage)?;
        return Err(PublishError::Refused(code));
    }

    if old_exists {
        if rename_no_replace(&golden, &backup).is_err() {
            remove_owned_directory(&stage, &stage_identity, &expected_stage)?;
            return Err(PublishError::Refused("concurrent_replacement"));
        }
        if directory_identity(&backup).ok().as_ref() != old_identity.as_ref()
            || snapshot(&backup).map_or(true, |moved| moved != old)
        {
            return Err(PublishError::RecoveryRequired(vec![stage, backup]));
        }
    }
    if rename_no_replace(&stage, &golden).is_err() {
        let mut recovery_paths = vec![stage.clone()];
        if old_exists {
            if fs::symlink_metadata(&golden).is_err() && rename_no_replace(&backup, &golden).is_ok()
            {
                recovery_paths.retain(|path| path != &backup);
            } else {
                recovery_paths.push(backup.clone());
            }
        }
        return Err(PublishError::RecoveryRequired(recovery_paths));
    }
    if old_exists {
        remove_owned_directory(&backup, old_identity.as_ref().unwrap(), &old)?;
    }
    if directory_identity(&golden).ok().as_ref() != Some(&stage_identity)
        || snapshot(&golden).map_or(true, |published| published != expected_stage)
    {
        return Err(PublishError::RecoveryRequired(vec![golden]));
    }
    Ok(entries.len())
}

fn main() {
    let command = parse_args(std::env::args().skip(1).collect())
        .unwrap_or_else(|| refuse("invalid_arguments"));
    let entries = registry::entries();
    registry::validate(&entries).unwrap_or_else(|_| refuse("invalid_registry"));

    match command {
        Command::List => {
            for entry in &entries {
                println!("{}", entry.golden_name());
            }
        }
        Command::Preview {
            screen,
            state,
            size,
        } => {
            let matches = entries
                .iter()
                .filter(|entry| {
                    entry.screen == screen
                        && entry.state == state
                        && size.is_none_or(|value| entry.size == value)
                })
                .collect::<Vec<_>>();
            if matches.len() != 1 {
                refuse("unknown_or_ambiguous_screen_state_size");
            }
            print!("{}", render_text(matches[0]));
        }
        Command::Write => match publish_goldens(&entries) {
            Ok(count) => println!(
                "{{\"schema\":\"tailrocks.tui-gallery/v1\",\"outcome\":\"success\",\"code\":\"goldens_published\",\"frames\":{count},\"mutations\":[\"golden/\"],\"recovery_artifacts\":[]}}"
            ),
            Err(PublishError::Refused(code)) => refuse(code),
            Err(PublishError::RecoveryRequired(paths)) => recovery(&paths),
        },
    }
}
