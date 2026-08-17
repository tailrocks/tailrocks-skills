//! Gallery preview binary.
//!
//!   --list                                  print every registry entry
//!   --screen <name> --state <state>         render one frame to stdout
//!   --write                                 regenerate golden/ from the registry
//!
//! `--write` is the only writer of golden/. Run it during design iteration
//! or after the user re-blesses a change — never to silence a red test.

use std::path::Path;

use app_gallery::{registry, render_text};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let flag = |name: &str| args.iter().any(|a| a == name);
    let value = |name: &str| {
        args.iter()
            .position(|a| a == name)
            .and_then(|i| args.get(i + 1))
            .cloned()
    };

    let entries = registry::entries();

    if flag("--list") {
        for e in &entries {
            println!("{}", e.golden_name());
        }
        return;
    }

    if flag("--write") {
        let golden = Path::new(env!("CARGO_MANIFEST_DIR")).join("golden");
        std::fs::create_dir_all(&golden).expect("golden dir");
        for e in &entries {
            let path = golden.join(e.golden_name());
            std::fs::write(&path, render_text(e)).expect("write frame");
            println!("wrote {}", path.display());
        }
        return;
    }

    let screen = value("--screen").expect("--screen <name>");
    let state = value("--state").unwrap_or_else(|| "default".into());
    let size = value("--size").map(|s| {
        let (w, h) = s.split_once('x').expect("--size WxH");
        (w.parse::<u16>().unwrap(), h.parse::<u16>().unwrap())
    });
    let entry = entries
        .iter()
        .find(|e| {
            e.screen == screen
                && e.state == state
                && size.is_none_or(|s| e.size == s)
        })
        .expect("unknown screen/state/size; try --list");
    print!("{}", render_text(entry));
}
