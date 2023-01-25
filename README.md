# Nix interpreter in Typescript

[Nix](https://nixos.org/manual/nix/stable/language/index.html)
is a functional domain-specific language that is useful for
package management.
This repository aims to implement a prototype interpreter for
Nix using Typescript.

## Requirement

```
deno 1.29
typescript 4.9
```

## Progress

Lexer: almost; need string optimization and path
Parser: almost; need unary operators
Interpreter: in progress

## Usage

Use interactively by
```{bash}
deno run repl.ts
```

Run tests by
```{bash}
deno run -A eval.ts
```

