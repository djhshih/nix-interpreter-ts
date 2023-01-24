1 + 2
2 + 1
5 + 3 * 4
3 * 4 + 5
2 + 4 / 2
4 / 2 + 2
[ 1 3 5 7 ]
{ x = 1; y = 2; }
if x > 0 then 1 else 10
let y = 2; in y + 2
x: x * 1
let f = x: y: x + y; in f 2 3
let s = { x = 1; y = 2; }; in with s; x
{ x = 1; y = 2; }.x
with { x = 3; z = 4; }; z
{ x, y }: x + y
{ x ? 1 + 3, y}: x - y
{ x, ... }: x + 20
{ x = 1; y = 2; } ? x
{ x = 1; y = 2; } // { x = 3; }
[ 1 2 3 4 ] ++ [ 1 2 3 ]
1 > 0 && 2 >= 1
0 > 1 || 2 >= 1
0 > 1 || 1 >= 1
let s = { x = 1; }; in s ? x -> s.x
