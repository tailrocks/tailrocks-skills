# Rule writing

A line is eligible only when a competent agent, given the repository and no
instruction file, would plausibly violate it and the violation has concrete
evidence. Formatter/linter/type/schema/validator rules belong in enforcement;
repeatable procedures belong in a skill; explanations belong in documentation;
permissions belong in settings.

Write one imperative fragment. Remove articles, hedging, preamble, and filler.
Preserve `not`, `never`, `no`, `only`, `except`, identifiers, commands, paths,
versions, units, and exact error strings. Add the mechanism only when the rule
otherwise appears arbitrary. A rule without an observable violation is refused.
