# Responsibility topology

Default to one independently invokable responsibility. Split jobs when they
have separate triggers and any separate output/oracle, authority, side effect,
or independent failure path. Rarely shared or conflicting rules strengthen the
split. Descriptions route resulting intents exclusively. A mode-heavy umbrella
is not one responsibility merely because one command selects its modes.

Keep phases together only when they form one transaction whose shared state and
invariants make isolated invocation invalid. Create stays one transaction:
evidence, contract, scaffold, semantic content, and wiring are invalid partial
outcomes.
