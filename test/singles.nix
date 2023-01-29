1 + 2
2 + 1
5 + 3 * 4
3 * 4 + 5
2 + 4 / 2
4 / 2 + 2
[ 1 3 5 7 ]
{ x = 1; y = 2; }
let y = 2; in y + 2
let x = -1; in if x > 0 then 1 else 10
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
let s = { x = 1; }; in s ? x -> s.x > 0
"apple"
"He said, \"I love to program!\""
"apple" + " orange"
!true
!false && true
-3
-9 / 3
1 + (-4 / 3)
0 == 0
0 != 0
4 == 4.0
4 != 4.0
5 == 5.00001
5 != 5.00001
"apple" == "apple"
"apple" != "apple"
"apple" == "orange"
let x = 1; in x == 1
let x = 2; in x != 0
[ 1 2 3 ] == [ 1 2 3 ]
[ 1 2 3 ] != [ 2 3 4 5 ]
{ x = 1; } == { x = 1; }
{ x = 1; y = 1; } == { x = 1; }
# comment
1 # comment
1 /* comment */ 1
/* comment */
{ x = 4; y = 2; z = 3; } // { w = 0; x = 1; }
[ (1 + 2) 3 ]
