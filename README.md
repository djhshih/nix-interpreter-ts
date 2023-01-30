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

## Pending

- deep equality for set
- deep equality for list
- @ notation for parameter set
- built-in functions
- path

See full list of pending items using `ripgrep` by
```{bash}
rg TODO
```

## Divergence

Nix: equality expression always returns false for functions.  
Here: equality on functions is based on reference.  

Nix: `inherit` keyword is used to inherit attributes: `{ inherit a b; c = 1; }`
Here: `{ a; b; c = 1; }`

Nix: sets cannot self-reference without the `rec` keyword
Here: all sets can self-reference


## Usage

Use interactively by
```{bash}
deno run repl.ts
```

Run tests by
```{bash}
deno run -A eval.ts
```

