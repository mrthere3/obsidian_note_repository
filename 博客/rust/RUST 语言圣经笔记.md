---
categories: [rust]
cover:
title: RUST 语言圣经笔记
date: 2024-11-19
updated: 2024-11-24
---
# *RUST* 语言圣经笔记

> [关于本书 - Rust 语言圣经(Rust Course)](https://course.rs/about-book.html)

每次学习 rust 都有很多不理解, 学习这门语言的过程中, 拥有那种越是学习越是能够一点点得到豁然开朗之感.这是记录.其他遇到的一些难题的记录.看书总是很枯燥，所以一边看一边写一边敲，可以帮助自己记忆的更加深刻，对一些重点知识也能掌握的更好~

# 基本变量

## 浮点数

在任何语言中, 关于浮点数都要格外注意

#### [浮点数陷阱](https://course.rs/basic/base-type/numbers.html#浮点数陷阱)

浮点数由于底层格式的特殊性，导致了如果在使用浮点数时不够谨慎，就可能造成危险，有两个原因：

1. **浮点数往往是你想要数字的近似表达** 浮点数类型是基于二进制实现的，但是我们想要计算的数字往往是基于十进制，例如 `0.1` 在二进制上并不存在精确的表达形式，但是在十进制上就存在。这种不匹配性导致一定的歧义性，更多的，虽然浮点数能代表真实的数值，但是由于底层格式问题，它往往受限于定长的浮点数精度，如果你想要表达完全精准的真实数字，只有使用无限精度的浮点数才行
2. **浮点数在某些特性上是反直觉的** 例如大家都会觉得浮点数可以进行比较，对吧？是的，它们确实可以使用 `>`，`>=` 等进行比较，但是在某些场景下，这种直觉上的比较特性反而会害了你。因为 `f32` ， `f64` 上的比较运算实现的是 `std::cmp:: PartialEq ` 特征(类似其他语言的接口)，但是并没有实现 ` std::cmp:: Eq` 特征，但是后者在其它数值类型上都有定义，说了这么多，可能大家还是云里雾里，用一个例子来举例：

Rust 的 `HashMap` 数据结构，是一个 KV 类型的 Hash Map 实现，它对于 `K` 没有特定类型的限制，但是要求能用作 `K` 的类型必须实现了 `std::cmp:: Eq ` 特征，因此这意味着你无法使用浮点数作为 ` HashMap ` 的 ` Key `，来存储键值对，但是作为对比，Rust 的整数类型、字符串类型、布尔类型都实现了该特征，因此可以作为 ` HashMap ` 的 ` Key`。

为了避免上面说的两个陷阱，你需要遵守以下准则：

+ 避免在浮点数上测试相等性

+ 当结果在数学上可能存在未定义时，需要格外的小心

## 字符, **bool**, 单元类型

### 字符

Rust 的字符不仅仅是 `ASCII`，所有的 `Unicode` 值都可以作为 Rust 字符，包括单个的中文、日文、韩文、emoji 表情符号等等，都是合法的字符类型。`Unicode` 值的范围从 `U+0000 ~ U+D7FF` 和 `U+E000 ~ U+10FFFF`。不过“字符”并不是 `Unicode` 中的一个概念，所以人在直觉上对“字符”的理解和 Rust 的字符概念并不一致。

由于 `Unicode` 都是 4 个字节编码，因此字符类型也是占用 4 个字节：



> 注意，我们还没开始讲字符串，但是这里提前说一下，和一些语言不同，Rust 的字符只能用 `''` 来表示， `""` 是留给字符串的。

### 单元类型

单元类型就是 `()` ，对，你没看错，就是 `()` ，唯一的值也是 `()` ，

`main` 函数就返回这个单元类型 `()`，你不能说 `main` 函数无返回值，因为没有返回值的函数在 Rust 中是有单独的定义的：`发散函数( diverge`

`function )`，顾名思义，无法收敛的函数。

例如常见的 `println!()` 的返回值也是单元类型 `()`。

再比如，你可以用 `()` 作为 `map` 的值，表示我们不关注具体的值，只关注 `key`。 这种用法和 Go 语言的 ***struct{}*** 类似，可以作为一个值用来占位，但是完全 **不占用** 任何内存。

## 语句和表达式    

### 语句

语句会执行一些操作但是不会返回一个值

### 表达式

表达式会进行求值，然后返回一个值。例如 `5 + 6`，在求值后，返回值 `11`，因此它就是一条表达式。

表达式可以成为语句的一部分，例如 `let y = 6` 中，`6` 就是一个表达式，它在求值后返回一个值 `6`（有些反直觉，但是确实是表达式）。

调用一个函数是表达式，因为会返回一个值，调用宏也是表达式，用花括号包裹最终返回一个值的语句块也是表达式，总之，能返回值，它就是表达式:

在 Rust 中，一定要严格区分 **表达式** 和 **语句** 的区别，这个在其它语言中往往是被忽视的点。

# 所有权与借用

内存回收的三大流派:

+ **垃圾回收机制(GC)**，在程序运行时不断寻找不再使用的内存，典型代表：Java、Go
+ **手动管理内存的分配和释放**, 在程序中，通过函数调用的方式来申请和释放内存，典型代表：C++
+ **通过所有权来管理内存**，编译器在编译时会根据一系列规则进行检查

## 所有权

### 所有权原则

>
>
>1. Rust 中每一个值都被一个变量所拥有，该变量被称为值的所有者
>2. 一个值同时只能被一个变量所拥有，或者说一个值只能拥有一个所有者
>3. 当所有者（变量）离开作用域范围时，这个值将被丢弃(drop)

### 克隆(深拷贝)

首先，**Rust 永远也不会自动创建数据的 “深拷贝”**。因此，任何 **自动** 的复制都不是深拷贝，可以被认为对运行时性能影响较小。

如果我们 **确实** 需要深度复制 `String` 中堆上的数据，而不仅仅是栈上的数据，可以使用一个叫做 `clone` 的方法。

```rust
let s1 = String::from("hello");
let s2 = s1.clone();

println!("s1 = {}, s2 = {}", s1, s2);
```

这段代码能够正常运行，说明 `s2` 确实完整的复制了 `s1` 的数据。

如果代码性能无关紧要，例如初始化程序时或者在某段时间只会执行寥寥数次时，你可以使用 `clone` 来简化编程。但是对于执行较为频繁的代码（热点路径），使用 `clone` 会极大的降低程序性能，需要小心使用！

### 拷贝(浅拷贝)

浅拷贝只发生在栈上，因此性能很高，在日常编程中，浅拷贝无处不在。

再回到之前看过的例子:

```rust
let x = 5;
let y = x;

println!("x = {}, y = {}", x, y);
```

但这段代码似乎与我们刚刚学到的内容相矛盾：没有调用 `clone`，不过依然实现了类似深拷贝的效果 —— 没有报所有权的错误。

原因是像整型这样的基本类型在编译时是已知大小的，会被存储在栈上，所以拷贝其实际的值是快速的。这意味着没有理由在创建变量 `y` 后使 `x` 无效（`x`、`y` 都仍然有效）。换句话说，这里没有深浅拷贝的区别，因此这里调用 `clone` 并不会与通常的浅拷贝有什么不同，我们可以不用管它（可以理解成在栈上做了深拷贝）。

Rust 有一个叫做 `Copy` 的特征，可以用在类似整型这样在栈中存储的类型。如果一个类型拥有 `Copy` 特征，一个旧的变量在被赋值给其他变量后仍然可用，也就是赋值的过程即是拷贝的过程。

那么什么类型是可 `Copy` 的呢？可以查看给定类型的文档来确认，这里可以给出一个通用的规则： **任何基本类型的组合可以 `Copy` ，不需要分配内存或某种形式资源的类型是可以 `Copy` 的**。如下是一些 `Copy` 的类型：

+ 所有整数类型，比如 `u32`
+ 布尔类型，`bool`，它的值是 `true` 和 `false`
+ 所有浮点数类型，比如 `f64`
+ 字符类型，`char`
+ 元组，当且仅当其包含的类型也都是 `Copy` 的时候。比如，`(i32, i32)` 是 `Copy` 的，但 `(i32, String)` 就不是
+ 不可变引用 `&T` ，例如 [转移所有权](https://course.rs/basic/ownership/ownership.html#转移所有权) 中的最后一个例子，**但是注意：可变引用 `&mut T` 是不可以 Copy 的**

### 函数传值与返回

将值传递给函数，一样会发生 `移动` 或者 `复制`，就跟 `let` 语句一样，下面的代码展示了所有权、作用域的规则：

```rust
fn main() {
    let s = String::from("hello");  // s 进入作用域

    takes_ownership(s);             // s 的值移动到函数里 ...
                                    // ... 所以到这里不再有效

    let x = 5;                      // x 进入作用域

    makes_copy(x);                  // x 应该移动函数里，
                                    // 但 i32 是 Copy 的，所以在后面可继续使用 x

} // 这里, x 先移出了作用域，然后是 s。但因为 s 的值已被移走，
  // 所以不会有特殊操作

fn takes_ownership(some_string: String) { // some_string 进入作用域
    println!("{}", some_string);
} // 这里，some_string 移出作用域并调用 `drop` 方法。占用的内存被释放

fn makes_copy(some_integer: i32) { // some_integer 进入作用域
    println!("{}", some_integer);
} // 这里，some_integer 移出作用域。不会有特殊操作
```

你可以尝试在 `takes_ownership` 之后，再使用 `s`，看看如何报错？例如添加一行 `println!("在move进函数后继续使用s: {}",s);`。

同样的，函数返回值也有所有权，例如:

```rust
fn main() {
    let s1 = gives_ownership();         // gives_ownership 将返回值
    // 移给 s1

    let s2 = String::from("hello");     // s2 进入作用域

    let s3 = takes_and_gives_back(s2);  // s2 被移动到
    // takes_and_gives_back 中,
    // 它也将返回值移给 s3
} // 这里, s3 移出作用域并被丢弃。s2 也移出作用域，但已被移走，
// 所以什么也不会发生。s1 移出作用域并被丢弃

fn gives_ownership() -> String {             // gives_ownership 将返回值移动给
    // 调用它的函数

    let some_string = String::from("hello"); // some_string 进入作用域.

    some_string                              // 返回 some_string 并移出给调用的函数
}

// takes_and_gives_back 将传入字符串并返回该值
fn takes_and_gives_back(a_string: String) -> String { // a_string 进入作用域

    a_string  // 返回 a_string 并移出给调用的函数
}
```

## 引用与借用

如果仅仅支持通过转移所有权的方式获取一个值，那会让程序变得复杂。 Rust 能否像其它编程语言一样，使用某个变量的指针或者引用呢？答案是可以。

Rust 通过 `借用(Borrowing)` 这个概念来达成上述的目的，**获取变量的引用，称之为借用(borrowing)**。正如现实生活中，如果一个人拥有某样东西，你可以从他那里借来，当使用完毕后，也必须要物归原主。

### 引用与解引用

常规引用是一个指针类型，指向了对象存储的内存地址。在下面代码中，我们创建一个 `i32` 值的引用 `y`，然后使用解引用运算符来解出 `y` 所使用的值:

```rust
fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

变量 `x` 存放了一个 `i32` 值 `5`。`y` 是 `x` 的一个引用。可以断言 `x` 等于 `5`。然而，如果希望对 `y` 的值做出断言，必须使用 `*y` 来解出引用所指向的值（也就是 **解引用**）。一旦解引用了 `y`，就可以访问 `y` 所指向的整型值并可以与 `5` 做比较。

### 不可变引用

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

能注意到两点：

1. 无需像上章一样：先通过函数参数传入所有权，然后再通过函数返回来传出所有权，代码更加简洁
2. `calculate_length` 的参数 `s` 类型从 `String` 变为 `&String`

这里，`&` 符号即是引用，它们允许你使用值，但是不获取所有权，通过 `&s1` 语法，我们创建了一个 **指向 `s1` 的引用**，但是并不拥有它。因为并不拥有这个值，当引用离开作用域后，其指向的值也不会被丢弃。

### 可变引用

```rust
fn main() {
    let mut s = String::from("hello");

    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

首先，声明 `s` 是可变类型，其次创建一个可变的引用 `&mut s` 和接受可变引用参数 `some_string: &mut String` 的函数。

不过可变引用并不是随心所欲、想用就用的，它有一个很大的限制： **同一作用域，特定数据只能有一个可变引用**：

### 借用规则总结

总的来说，借用规则如下：

+ <font color='red'> **同一时刻，你只能拥有要么一个可变引用，要么任意多个不可变引用** </font> >
+ **<font color='red'> 引用必须总是有效的 </font>**

> 悬垂引用也叫做悬垂指针，意思为指针指向某个值后，这个值被释放掉了，而指针仍然存在，其指向的内存可能不存在任何值或已被其它变量重新使用。在 Rust 中编译器可以确保引用永远也不会变成悬垂状态：当你获取数据的引用后，编译器可以确保数据不会在引用结束前被释放，要想释放数据，必须先停止其引用的使用。

# 复合类型

## 字符串

**Rust 中的字符是 Unicode 类型，因此每个字符占据 4 个字节内存空间，但是在字符串中不一样，字符串是 UTF-8 编码，也就是字符串中的字符所占的字节数是变化的(1 - 4)**，这样有助于大幅降低字符串所占用的内存空间。

Rust 在语言级别，只有一种字符串类型： `str`，它通常是以引用类型出现 `&str`，也就是上文提到的字符串切片。虽然语言级别只有上述的 `str` 类型，但是在标准库里，还有多种不同用途的字符串类型，其中使用最广的即是 `String` 类型。

`str` 类型是硬编码进可执行文件，也无法被修改，但是 `String` 则是一个可增长、可改变且具有所有权的 UTF-8 编码字符串，**当 Rust 用户提到字符串时，往往指的就是 `String` 类型和 `&str` 字符串切片类型，这两个类型都是 UTF-8 编码**。

### String 与 &str 的转换

#### &str 转化为 String

```rust
String::from("hello,world")
"hello,world".to_string()
```

#### String 类型转为 &str 

直接取引用就可以了

```rust
fn main() {
    let s = String::from("hello,world!");
    say_hello(&s);
    say_hello(&s[..]);
    say_hello(s.as_str());
}

fn say_hello(s: &str) {
    println!("{}",s);
}
```

### 字符串字面量是切片

```rus
let s = "Hello, world!";
```

rust 中常规定义的字符串是&str 类型, 因为它是个不可变引用, 所以无法修改.

### 字符串索引

**<font color="red"> 在其它语言中，使用索引的方式访问字符串的某个字符或者子串是很正常的行为，但是在 Rust 中就会报错：</font>**

字符串的底层的数据存储格式实际上是 [ `u8` ]，一个字节数组。对于 `let hello = String::from("Hola");` 这行代码来说，`Hola` 的长度是 `4` 个字节，因为 `"Hola"` 中的每个字母在 UTF-8 编码中仅占用 1 个字节，但是对于下面的代码呢？

```rust
let hello = String::from("中国人");
```

如果问你该字符串多长，你可能会说 `3`，但是实际上是 `9` 个字节的长度，因为大部分常用汉字在 UTF-8 中的长度是 `3` 个字节，因此这种情况下对 `hello` 进行索引，访问 `&hello[0]` 没有任何意义，因为你取不到 `中` 这个字符，而是取到了这个字符三个字节中的第一个字节，这是一个非常奇怪而且难以理解的返回值。

字符串切片是非常危险的操作，因为切片的索引是通过字节来进行，但是字符串又是 UTF-8 编码，**因此你无法保证索引的字节刚好落在字符的边界上**

### 操作字符串

#### 追加 (Push)

在字符串尾部可以使用 `push()` 方法追加字符 `char`，也可以使用 `push_str()` 方法追加字符串字面量。这两个方法都是 **在原有的字符串上追加，并不会返回新的字符串**。由于字符串追加操作要修改原来的字符串，则该字符串必须是可变的，即 **字符串变量必须由 `mut` 关键字修饰**。

#### 插入 (Insert)

可以使用 `insert()` 方法插入单个字符 `char`，也可以使用 `insert_str()` 方法插入字符串字面量，与 `push()` 方法不同，这俩方法需要传入两个参数，第一个参数是字符（串）插入位置的索引，第二个参数是要插入的字符（串），索引从 0 开始计数，如果越界则会发生错误。由于字符串插入操作要 **修改原来的字符串**，则该字符串必须是可变的，即 **字符串变量必须由 `mut` 关键字修饰**。

#### 替换 (Replace)

如果想要把字符串中的某个字符串替换成其它的字符串，那可以使用 `replace()` 方法。与替换有关的方法有三个。

1. replace

    该方法可适用于 `String` 和 `&str` 类型。`replace()` 方法接收两个参数，第一个参数是要被替换的字符串，第二个参数是新的字符串。该方法会替换所有匹配到的字符串。**该方法是返回一个新的字符串，而不是操作原来的字符串**。

2. replacen

    该方法可适用于 `String` 和 `&str` 类型。`replacen()` 方法接收三个参数，前两个参数与 `replace()` 方法一样，第三个参数则表示替换的个数。**该方法是返回一个新的字符串，而不是操作原来的字符串**。

3. replace_range

    该方法仅适用于 `String` 类型。`replace_range` 接收两个参数，第一个参数是要替换字符串的范围（Range），第二个参数是新的字符串。**该方法是直接操作原来的字符串，不会返回新的字符串。该方法需要使用 `mut` 关键字修饰**。

    ```rust
    fn main() {
        let mut string_replace_range = String::from("I like rust!");
        string_replace_range.replace_range(7..8, "R");
        dbg!(string_replace_range);
    }
    
    // 运行结果:string_replace_range = "I like Rust!"
    ```

#### 删除 (Delete)

与字符串删除相关的方法有 4 个，它们分别是 `pop()`，`remove()`，`truncate()`，`clear()`。这四个方法仅适用于 `String` 类型。

1、 `pop` —— 删除并返回字符串的最后一个字符

**该方法是直接操作原来的字符串**。但是存在返回值，其返回值是一个 `Option` 类型，如果字符串为空，则返回 `None`。

2、 `remove` —— 删除并返回字符串中指定位置的字符

**该方法是直接操作原来的字符串**。但是存在返回值，其返回值是删除位置的字符串，只接收一个参数，表示该字符起始索引位置。`remove()` 方法是按照字节来处理字符串的，如果参数所给的位置不是合法的字符边界，则会发生错误。

3、`truncate` —— 删除字符串中从指定位置开始到结尾的全部字符

**该方法是直接操作原来的字符串**。无返回值。该方法 `truncate()` 方法是按照字节来处理字符串的，如果参数所给的位置不是合法的字符边界，则会发生错误。

4、`clear` —— 清空字符串

**该方法是直接操作原来的字符串**。调用后，删除字符串中的所有字符，相当于 `truncate()` 方法参数为 0 的时候。

#### 连接 (Concatenate)

1、使用 `+` 或者 `+=` 连接字符串

使用 `+` 或者 `+=` 连接字符串，要求右边的参数必须为字符串的切片引用（Slice）类型。其实当调用 `+` 的操作符时，相当于调用了 `std::string` 标准库中的 [`add()`](https://doc.rust-lang.org/std/string/struct.String.html#method.add) 方法，这里 `add()` 方法的第二个参数是一个引用的类型。因此我们在使用 `+` 时， 必须传递切片引用类型。不能直接传递 `String` 类型。**`+` 是返回一个新的字符串，所以变量声明可以不需要 `mut` 关键字修饰**。

```rust
fn main() {
    let string_append = String::from("hello ");
    let string_rust = String::from("rust");
    // &string_rust会自动解引用为&str
    let result = string_append + &string_rust;
    let mut result = result + "!"; // `result + "!"` 中的 `result` 是不可变的
    result += "!!!";

    println!("连接字符串 + -> {}", result);
}
//连接字符串 + -> hello rust!!!!
```

2、使用 `format!` 连接字符串

`format!` 这种方式适用于 `String` 和 `&str` 。`format!` 的用法与 `print!` 的用法类似，详见 [格式化输出](https://course.rs/basic/formatted-output.html#printprintlnformat)。

```rust
fn main() {
    let s1 = "hello";
    let s2 = String::from("rust");
    let s = format!("{} {}!", s1, s2);
    println!("{}", s);
}

```

### 字符串转义

我们可以通过转义的方式 \ 输出 ASCII 和 Unicode 字符。

### 操作 UTF-8 字符串

#### 字符

如果你想要以 Unicode 字符的方式遍历字符串，最好的办法是使用 `chars` 方法，例如：

```rust
for c in "中国人".chars() {
    println!("{}", c);
}
/*
中
国
人
*/
```

#### 字节

这种方式是返回字符串的底层字节数组表现形式：

```rust
for b in "中国人".bytes() {
    println!("{}", b);
}
/*
228
184
173
229
155
189
228
186
186
*/
```

#### 获取子串

想要准确的从 UTF-8 字符串中获取子串是较为复杂的事情，例如想要从 `holla中国人नमस्ते` 这种变长的字符串中取出某一个子串，使用标准库你是做不到的。 你需要在 `crates.io` 上搜索 `utf8` 来寻找想要的功能。

可以考虑尝试下这个库：[utf8_slice](https://crates.io/crates/utf8_slice)。

## 元组

元组是由多种类型组合到一起形成的，因此它是复合类型，元组的长度是固定的，元组中元素的顺序也是固定的。

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

**用 . 来访问元组**

## 结构体

### 定义结构体

一个结构体由几部分组成：

+ 通过关键字 `struct` 定义
+ 一个清晰明确的结构体 `名称`
+ 几个有名字的结构体 `字段`

### 创建结构体实例



1. 初始化实例时，**每个字段** 都需要进行初始化
2. 初始化时的字段顺序 **不需要** 和结构体定义时的顺序一致

### 访问结构体字段

通过 `.` 操作符即可访问结构体实例内部的字段值，也可以修改它们

### 简化结构体创建

当函数参数和结构体字段同名时，可以直接使用缩略的方式进行初始化，跟 TypeScript 中一模一样。

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}

```

### 结构体更新语法

根据已有的 `user1` 实例来构建 `user2`：

```rust
  let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
```

因为 `user2` 仅仅在 `email` 上与 `user1` 不同，因此我们只需要对 `email` 进行赋值，剩下的通过结构体更新语法 `..user1` 即可完成, `..user1` 必须在结构体的尾部使用。

### 元组结构体(Tuple Struct)

结构体必须要有名称，但是结构体的字段可以没有名称，这种结构体长得很像元组，因此被称为元组结构体，例如：

```rust
    struct Color(i32, i32, i32);
    struct Point(i32, i32, i32);

    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);

```

### 单元结构体(Unit-like Struct)

如果你定义一个类型，但是不关心该类型的内容，只关心它的行为时，就可以使用 `单元结构体`：

```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {

}

```

### 使用 [derive(Debug)] 来打印结构体的信息

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {:?}", rect1);
}
```

## 枚举

枚举(enum 或 enumeration)允许你通过列举可能的成员来定义一个 **枚举类型**，例如扑克牌花色：

```rust
enum PokerSuit {
  Clubs,
  Spades,
  Diamonds,
  Hearts,
}

```

**枚举类型是一个类型，它会包含所有可能的枚举成员，而枚举值是该类型中的具体某个成员的实例。**

**任何类型的数据都可以放入枚举成员中**

## 数组

**我们这里说的数组是 Rust 的基本类型，是固定长度的，这点与其他编程语言不同，其它编程语言的数组往往是可变长度的，与 Rust 中的动态数组 `Vector` 类似**

### 创建数组

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
}

let a: [i32; 5] = [1, 2, 3, 4, 5];
```

因此 **数组 `array` 是存储在栈上**，性能也会非常优秀。与此对应，**动态数组 `Vector` 是存储在堆上**，因此长度可以动态改变。当你不确定是使用数组还是动态数组时, 那就应该使用后者

**数组的元素类型要统一，长度要固定**。

**某个值重复出现 N 次的数组**：

```rust
let a = [3; 5];
```

`a` 数组包含 `5` 个元素，这些元素的初始化值为 `3`，聪明的读者已经发现，这种语法跟数组类型的声明语法其实是保持一致的：`[3; 5]` 和 `[类型; 长度]`。

### 访问数组元素

因为数组是连续存放元素的，因此可以通过索引的方式来访问存放其中的元素：

### 数组元素为非基础类型

```rust
let array: [String; 8] = std::array:: from_fn(|_i| String:: from("rust is good!"));

println!("{:#?}", array);

```

### 数组切片

``` rust
let a: [i32; 5] = [1, 2, 3, 4, 5];

let slice: &[i32] = &a [1..3];

assert_eq!(slice, &[2, 3]);

```

### 切片特点总结

+ 切片的长度可以与数组不同，并不是固定的，而是取决于你使用时指定的起始和结束位置
+ 创建切片的代价非常小，因为切片只是针对底层数组的一个引用
+ 切片类型 [T] 拥有不固定的大小，而切片引用类型 &[T] 则具有固定的大小，因为 Rust 很多时候都需要固定大小数据类型，因此 &[T] 更有用，`&str` 字符串切片也同理

# 流程控制

## if else if

[使用 if 来做分支控制](https://course.rs/basic/flow-control.html#使用-if-来做分支控制)

[使用 else if 来处理多重条件](https://course.rs/basic/flow-control.html#使用-else-if-来处理多重条件)

## for 循环

| 使用方法                      | 等价使用方式                                      | 所有权     |
| ----------------------------- | ------------------------------------------------- | ---------- |
| `for item in collection`      | `for item in IntoIterator::into_iter(collection)` | 转移所有权 |
| `for item in &collection`     | `for item in collection.iter()`                   | 不可变借用 |
| `for item in &mut collection` | `for item in collection.iter_mut()`               | 可变借用   |

**获取元素的索引**：

``` rust
fn main() {
    let a = [4, 3, 2, 1];
    // `.iter()` 方法把 `a` 数组变成一个迭代器
    for (i, v) in a.iter().enumerate() {
        println!("第{}个元素是{}", i + 1, v);
    }
}
```

## loop 循环

因为 `loop` 就是一个简单的无限循环，你可以在内部实现逻辑通过 `break` 关键字来控制循环何时结束。

``` rust
fn main() {
    loop {
        println!("again!");
    }
}
```

> 感觉用不太到

+ **break 可以单独使用，也可以带一个返回值**，有些类似 `return`
+ **loop 是一个表达式**，因此可以返回一个值

# 模式匹配

## match 和 let

``` rust
enum Direction {
    East,
    West,
    North,
    South,
}

fn main() {
    let dire = Direction:: South;
    match dire {
        Direction:: East => println!("East"),
        Direction:: North | Direction:: South => {
            println!("South or North");
        },
        _ => println!("West"),
    };
}
```

+ `match` 的匹配必须要穷举出所有可能，因此这里用 `_` 来代表未列出的所有可能性
+ `match` 的每一个分支都必须是一个表达式，且所有分支的表达式最终返回值的类型必须相同
+ **X | Y**，类似逻辑运算符 `或`，代表该分支可以匹配 `X` 也可以匹配 `Y`，只要满足一个即可

### match 匹配

格式

``` rust
match target {
    模式 1 => 表达式 1,
    模式 2 => {
        语句 1;
        语句 2;
        表达式 2
    },
    _ => 表达式 3
}

```

### 使用 match 表达式赋值

``` rust
enum IpAddr {
   Ipv4,
   Ipv6
}

fn main() {
    let ip1 = IpAddr:: Ipv6;
    let ip_str = match ip1 {
        IpAddr:: Ipv4 => "127.0.0.1",
        _ => ":: 1",
    };

    println!("{}", ip_str);
}
//所以将 ":: 1" 赋值给了 ip_str。
```

### 模式绑定

``` rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin:: Penny => 1,
        Coin:: Nickel => 5,
        Coin:: Dime => 10,
        Coin:: Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}

```

在匹配 `Coin::Quarter(state)` 模式时，我们把它内部存储的值绑定到了 `state` 变量上，

### 穷尽匹配和_通配符

`match` 的匹配必须穷尽所有情况, 否则 rust 编译器就会抛出一个错误.

当我们不想在匹配时列出所有值的时候，可以使用 Rust 提供的一个特殊 **模式**，因为可以使用特殊的模式 `_` 替代

### if let 匹配

有时会遇到只有一个模式的值需要被处理，其它值直接忽略的场景，如果用 `match` 来处理就非常罗嗦：

代码对比

``` rust
    let v = Some(3u8);
    match v {
        Some(3) => println!("three"),
        _ => (),
    }

if let Some(3) = v {
    println!("three");
}

```

使用场景: **当你只要匹配一个条件，且忽略其他条件时就用 `if let` ，否则都用 `match`**。

### matches! 宏

Rust 标准库中提供了一个非常实用的宏：`matches!`，它可以将一个表达式跟模式进行匹配，然后返回匹配的结果 `true` or `false`。

``` rust
let foo = 'f';
assert!(matches!(foo, 'A'..='Z' | 'a'..='z'));

let bar = Some(4);
assert!(matches!(bar, Some(x) if x > 2));

```

### 变量遮蔽

无论是 `match` 还是 `if let`，这里都是一个新的代码块，而且这里的绑定相当于新变量，如果你使用同名变量，会发生变量遮蔽

**`match` 中的变量遮蔽其实不是那么的容易看出**，因此要小心！<font color='red'> 其实这里最好不要使用同名 </font>，避免难以理解

## 解构 Option

### Option

`Option` 枚举包含两个成员，一个成员表示含有值：`Some(T)`, 另一个表示没有值：`None`，定义如下：

``` rust
enum Option <T> {
    Some(T),
    None,
}
```

匹配 Option <T>

``` rust
fn plus_one(x: Option <i32>) -> Option <i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
// i 匹配到 Some 中的指 
```

# 模式适用场景

## 模式

模式是 Rust 中的特殊语法，它用来匹配类型中的结构和数据，它往往和 `match` 表达式联用，以实现强大的模式匹配能力。模式一般由以下内容组合而成：

+ 字面值
+ 解构的数组、枚举、结构体或者元组
+ 变量
+ 通配符
+ 占位符

``` rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}

```



`match` 的每个分支就是一个 **模式**，因为 `match` 匹配是穷尽式的，因此我们往往需要一个特殊的模式 `_`，来匹配剩余的所有情况：

### if let 分支

`if let` 往往用于匹配一个模式，而忽略剩下的所有模式的场景：

``` rust
if let PATTERN = SOME_VALUE {

}

```

# 全模式列表

## 匹配字面值

``` rust
let x = 1;

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}

```

## 匹配命名变量

``` rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {:?}", y),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

## 单分支多模式

在 `match` 表达式中，可以使用 `|` 语法匹配多个模式，它代表 **或** 的意思。例如，如下代码将 `x` 的值与匹配分支相比较，第一个分支有 **或** 选项，意味着如果 `x` 的值匹配此分支的任何一个模式，它就会运行：

``` rust
let x = 1;

match x {
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}

```

## 通过序列 ..= 匹配值的范围

``` rust
let x = 5;

match x {
    1..= 5 => println!("one through five"),
    _ => println!("something else"),
}
//如果 x 是 1、2、3、4 或 5，第一个分支就会匹配。
```

**序列只允许用于数字或字符类型**，原因是：它们可以连续，同时编译器在编译期可以检查该序列是否为空，字符和数字值是 Rust 中仅有的可以用于判断是否为空的类型

## 解构并分解值

``` rust
//let 解构一个带有两个字段 x 和 y 的结构体 Point
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
    //
    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}
```

**模式中的变量名不必与结构体中的字段名一致**。不过通常希望变量名与字段名一致以便于理解变量来自于哪些字段

## 解构枚举

结构一个复杂的枚举类型

``` rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message:: ChangeColor(0, 160, 255);

    match msg {
        Message:: Quit => {
            println!("The Quit variant has no data to destructure.")
        }
        Message:: Move { x, y } => {
            println!(
                "Move in the x direction {} and in the y direction {}",
                x,
                y
            );
        }
        Message:: Write(text) => println!("Text message: {}", text),
        Message:: ChangeColor(r, g, b) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
    }
}
```

## 解构嵌套的结构体和枚举

``` rust
enum Color {
   Rgb(i32, i32, i32),
   Hsv(i32, i32, i32),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message:: ChangeColor(Color:: Hsv(0, 160, 255));

    match msg {
        Message:: ChangeColor(Color:: Rgb(r, g, b)) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
        Message:: ChangeColor(Color:: Hsv(h, s, v)) => {
            println!(
                "Change the color to hue {}, saturation {}, and value {}",
                h,
                s,
                v
            )
        }
        _ => ()
    }
}
```

## 解构数组

``` rust
let arr: [u16; 2] = [114, 514];
let [x, y] = arr;

assert_eq!(x, 114);
assert_eq!(y, 514);

```

## 使用 _ 忽略整个值

虽然 `_` 模式作为 `match` 表达式最后的分支特别有用，但是它的作用还不限于此。例如可以将其用于函数参数中：

``` rust
fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {}", y);
}

fn main() {
    foo(3, 4);
}
```



## 使用嵌套的 _ 忽略部分值

``` rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value, new_setting_value) {
    (Some(_), Some(_)) => {
        println!("Can't overwrite an existing customized value");
    }
    _ => {
        setting_value = new_setting_value;
    }
}

println!("setting is {:?}", setting_value);

```



## 使用下划线开头忽略未使用的变量

如果你创建了一个变量却不在任何地方使用它，Rust 通常会给你一个警告，因为这可能会是个 BUG。但是有时创建一个不会被使用的变量是有用的，比如你正在设计原型或刚刚开始一个项目。这时你希望告诉 Rust 不要警告未使用的变量，为此可以用下划线作为变量名的开头：



注意, 只使用 `_` 和使用以下划线开头的名称有些微妙的不同：比如 **`_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定**。

## 用 .. 忽略剩余值

对于有多个部分的值，可以使用 `..` 语法来只使用部分值而忽略其它值，这样也不用再为每一个被忽略的值都单独列出下划线。`..` 模式会忽略模式中剩余的任何没有显式匹配的值部分。

``` rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
    Point { x, .. } => println!("x is {}", x),
}

```

## 匹配守卫提供的额外条件

**匹配守卫**（*match guard*）是一个位于 `match` 分支模式之后的额外 `if` 条件，它能为分支模式提供更进一步的匹配条件。

这个条件可以使用模式中创建的变量：

``` rust
let num = Some(4);

match num {
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}

```

也可以在匹配守卫中使用 **或** 运算符 `|` 来指定多个模式，**同时匹配守卫的条件会作用于所有的模式**。下面代码展示了匹配守卫与 `|` 的优先级

``` rust
let x = 4;
let y = false;

match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
//(4 | 5 | 6) if y => ...
```

## @绑定

`@`（读作 at）运算符允许为一个字段绑定另外一个变量。下面例子中，我们希望测试 `Message::Hello` 的 `id` 字段是否位于 `3..=7` 范围内，同时也希望能将其值绑定到 `id_variable` 变量中以便此分支中相关的代码可以使用它。我们可以将 `id_variable` 命名为 `id`，与字段同名，不过出于示例的目的这里选择了不同的名称。

``` rust
enum Message {
    Hello { id: i32 },
}

let msg = Message:: Hello { id: 5 };

match msg {
    Message:: Hello { id: id_variable @ 3..= 7 } => {
        println!("Found an id in range: {}", id_variable)
    },
    Message:: Hello { id: 10..= 12 } => {
        println!("Found an id in another range")
    },
    Message:: Hello { id } => {
        println!("Found some other id: {}", id)
    },
}

```

上例会打印出 `Found an id in range: 5`。通过在 `3..=7` 之前指定 `id_variable @`，我们捕获了任何匹配此范围的值并同时将该值绑定到变量 `id_variable` 上。

<font color='red'> 第二个分支只在模式中指定了一个范围，`id` 字段的值可以是 `10、11 或 12`，不过这个模式的代码并不知情也不能使用 `id` 字段中的值，因为没有将 `id` 值保存进一个变量。</font>

最后一个分支指定了一个没有范围的变量，此时确实拥有可以用于分支代码的变量 `id`，因为这里使用了结构体字段简写语法。不过此分支中没有像头两个分支那样对 `id` 字段的值进行测试：任何值都会匹配此分支。

## @前绑定后解构(Rust 1.56 新增)

使用 `@` 还可以在绑定新变量的同时，对目标进行解构：

````rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    // 绑定新变量 `p`，同时对 `Point` 进行解构
    let p @ Point {x: px, y: py } = Point {x: 10, y: 23};
    println!("x: {}, y: {}", px, py);
    println!("{:?}", p);


    let point = Point {x: 10, y: 5};
    if let p @ Point {x: 10, y} = point {
        println!("x is 10 and y is {} in {:?}", y, p);
    } else {
        println!("x was not 10 :(");
    }
}

````

# 方法 Method

## 定义方法

rust 使用 `impl` 来定义方法

``` rust
struct Circle {
    x: f64,
    y: f64,
    radius: f64,
}

impl Circle {
    // new 是 Circle 的关联函数，因为它的第一个参数不是 self，且 new 并不是关键字
    // 这种方法往往用于初始化当前结构体的实例
    fn new(x: f64, y: f64, radius: f64) -> Circle {
        Circle {
            x: x,
            y: y,
            radius: radius,
        }
    }

    // Circle 的方法，&self 表示借用当前的 Circle 结构体
    fn area(&self) -> f64 {
        std::f64::consts:: PI * (self.radius * self.radius)
    }
}

```

## <span id="self"> self、&self 和 &mut self </span>

在 `area` 的签名中，我们使用 `&self` 替代 `rectangle: &Rectangle`，`&self` 其实是 `self: &Self` 的简写（注意大小写）。在一个 `impl` 块内，`Self` 指代被实现方法的结构体类型，`self` 指代此类型的实例，换句话说，`self` 指代的是 `Rectangle` 结构体实例，这样的写法会让我们的代码简洁很多，而且非常便于理解：我们为哪个结构体实现方法，那么 `self` 就是指代哪个结构体的实例。

需要注意的是，`self` 依然有所有权的概念：

+ `self` 表示 `Rectangle` 的所有权转移到该方法中，这种形式用的较少
+ `&self` 表示该方法对 `Rectangle` 的不可变借用
+ `&mut self` 表示可变借用

## 关联函数

这种定义在 `impl` 中且没有 `self` 的函数被称之为 **关联函数**： 因为它没有 `self`，不能用 `f.read()` 的形式调用，因此它是一个函数而不是方法，它又在 `impl` 中，与结构体紧密关联，因此称为关联函数。

在之前的代码中，我们已经多次使用过关联函数，例如 `String::from`，用于创建一个动态字符串

``` rust
impl Rectangle {
    fn new(w: u32, h: u32) -> Rectangle {
        Rectangle { width: w, height: h }
    }
}

```

## 多个 impl 定义

Rust 允许我们为一个结构体定义多个 impl 块，目的是提供更多的灵活性和代码组织性，例如当方法多了后，可以把相关的方法组织在同一个 impl 块中，那么就可以形成多个 impl 块，各自完成一块儿目标：

``` rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

```

# 泛型和特征

## 泛型 Generics

``` rust
fn add <T>(a: T, b: T) -> T {
    a + b
}

fn main() {
    println!("add i8: {}", add(2i8, 3i8));
    println!("add i32: {}", add(20, 30));
    println!("add f64: {}", add(1.23, 1.23));
}
```

### 泛型详解

上面代码的 `T` 就是 **泛型参数**，实际上在 Rust 中，泛型参数的名称你可以任意起，但是出于惯例，我们都用 `T` （`T` 是 `type` 的首字母）来作为首选，这个名称越短越好，除非需要表达含义，否则一个字母是最完美的。

使用泛型参数，有一个先决条件，必需在使用前对其进行声明：

``` rust
fn largest <T>(list: &[T]) -> T {
```



### 显式地指定泛型的类型参数

不是所有 `T` 类型都能进行相加操作，因此我们需要用 `std::ops:: Add <Output = T> ` 对 ` T` 进行限制：

```rust
fn add<T: std::ops:: Add <Output = T> >(a: T, b: T) -> T {
    a + b
}
```



编译器无法推断你想要的泛型参数：

``` rust
use std::fmt:: Display;

fn create_and_print <T>() where T: From <i32> + Display {
    let a: T = 100.into(); // 创建了类型为 T 的变量 a，它的初始值由 100 转换而来
    println!("a is: {}", a);
}

fn main() {
    create_and_print();
}
```

`create_and_print` 是一个泛型函数，`T` 是一个类型参数，调用时必须明确它的具体类型。

你声明了 `T` 必须实现 `From<i32>` 和 `Display`，但没有指定使用什么类型作为 `T`。

Rust 编译器无法自动推断 `T`，因为 `create_and_print` 的实现没有使用任何能推断出具体类型的输入参数。因此，你必须在调用时显式地为 `T` 指定类型。



``` rust
use std::fmt:: Display;

fn create_and_print <T>() 
where 
    T: From <i32> + Display 
{
    let a: T = 100.into(); // 将 100 转换为 T 类型
    println!("a is: {}", a);
}

fn main() {
    create_and_print:: <i32>(); // 指定 T 为 i32
}

```



### 结构体中使用泛型

``` rust
struct Point <T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

这里有两点需要特别的注意：

+ **提前声明**，跟泛型函数定义类似，首先我们在使用泛型参数之前必需要进行声明 `Point<T>`，接着就可以在结构体的字段类型中使用 `T` 来替代具体的类型
+ **x 和 y 是相同的类型**



### 枚举中使用泛型

`Option` 永远是第一个应该被想起来的

``` rust
enum Option <T> {
    Some(T),
    None,
}

enum Result <T, E> {
    Ok(T),
    Err(E),
}

```



### 方法中使用泛型

``` rust
struct Point <T> {
    x: T,
    y: T,
}

impl <T> Point <T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```



使用泛型参数前，依然需要提前声明：`impl<T>`，只有提前声明了，我们才能在 `Point<T>` 中使用它，这样 Rust 就知道 `Point` 的尖括号中的类型是泛型而不是具体类型。需要注意的是，这里的 `Point<T>` 不再是泛型声明，而是一个完整的结构体类型，因为我们定义的结构体就是 `Point<T>` 而不再是 `Point`。



复杂一点的

``` rust
struct Point <T, U> {
    x: T,
    y: U,
}

impl <T, U> Point <T, U> {
    fn mixup <V, W>(self, other: Point <V, W>) -> Point <T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

`T,U` 是定义在结构体 `Point` 上的泛型参数，`V,W` 是单独定义在方法 `mixup` 上的泛型参数，它们并不冲突，说白了，你可以理解为，一个是结构体泛型，一个是函数泛型。

### 为具体的泛型类型实现方法

你不仅能定义基于 `T` 的方法，还能针对特定的具体类型，进行方法定义

``` rust
impl Point <f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

```



### const 泛型（Rust 1.51 版本引入的重要特性）

``` rust
fn display_array < T: std::fmt:: Debug, const N: usize >(arr: [T; N]) {
    println!("{:?}", arr);
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(arr);

    let arr: [i32; 2] = [1, 2];
    display_array(arr);
}
```



如上所示，我们定义了一个类型为 `[T; N]` 的数组，其中 `T` 是一个基于类型的泛型参数，这个和之前讲的泛型没有区别，而重点在于 `N` 这个泛型参数，它是一个基于值的泛型参数！因为它用来替代的是数组的长度。

`N` 就是 const 泛型，定义的语法是 `const N: usize`，表示 const 泛型 `N` ，它基于的值类型是 `usize`。

在泛型参数之前，Rust 完全不适合复杂矩阵的运算，自从有了 const 泛型，一切即将改变。

#### const fn 的基本用法

通常情况下，函数是在运行时被调用和执行的。然而，在某些场景下，我们希望在编译期就计算出一些值，以提高运行时的性能或满足某些编译期的约束条件。例如，定义数组的长度、计算常量值等。

有了 `const fn`，我们可以在编译期执行这些函数，从而将计算结果直接嵌入到生成的代码中。这不仅以高了运行时的性能，还使代码更加简洁和安全。

``` rust
const fn add(a: usize, b: usize) -> usize {
    a + b
}

const RESULT: usize = add(5, 10);

fn main() {
    println!("The result is: {}", RESULT);
}
```



#### 结合 const fn 与 const 泛型

将 `const fn` 与 `const 泛型` 结合，可以实现更加灵活和高效的代码设计。例如，创建一个固定大小的缓冲区结构，其中缓冲区大小由编译期计算确定：

``` rust
struct Buffer <const N: usize> {
    data: [u8; N],
}

const fn compute_buffer_size(factor: usize) -> usize {
    factor * 1024
}

fn main() {
    const SIZE: usize = compute_buffer_size(4);
    let buffer = Buffer:: <SIZE> {
        data: [0; SIZE],
    };
    println!("Buffer size: {} bytes", buffer.data.len());
}
```



#### 泛型的性能

在 Rust 中泛型是零成本的抽象，意味着你在使用泛型时，完全不用担心性能上的问题。

但是任何选择都是权衡得失的，既然我们获得了性能上的巨大优势，那么又失去了什么呢？Rust 是在编译期为泛型对应的多个类型，生成各自的代码，因此损失了编译速度和增大了最终生成文件的大小。

具体来说：

Rust 通过在编译时进行泛型代码的 **单态化**(*monomorphization*)来保证效率。单态化是一个通过填充编译时使用的具体类型，将通用代码转换为特定代码的过程。

编译器所做的工作正好与我们创建泛型函数的步骤相反，编译器寻找所有泛型代码被调用的位置并针对具体类型生成代码。

## 特征 Trait

### 定义特征

如果不同的类型具有相同的行为，那么我们就可以定义一个特征，然后为这些类型实现该特征。**定义特征** 是把一些方法组合在一起，目的是定义一个实现某些目标所必需的行为的集合。`概念有点像Go的接口`

``` rust
pub trait Summary {
    fn summarize(&self) -> String;
}

```

### 为类型实现特征

``` rust
pub trait Summary {
    fn summarize(&self) -> String;
}
pub struct Post {
    pub title: String, // 标题
    pub author: String, // 作者
    pub content: String, // 内容
}

impl Summary for Post {
    fn summarize(&self) -> String {
        format!("文章{}, 作者是{}", self.title, self.author)
    }
}

pub struct Weibo {
    pub username: String,
    pub content: String
}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}

```

#### 特征定义与实现的位置(孤儿规则)

> [!INFO]
>
> 关于特征实现与定义的位置，有一条非常重要的原则：**如果你想要为类型** `A` **实现特征** `T` **，那么** `A` **或者** `T` **至少有一个是在当前作用域中定义的！** 例如我们可以为上面的 `Post` 类型实现标准库中的 `Display` 特征，这是因为 `Post` 类型定义在当前的作用域中。同时，我们也可以在当前包中为 `String` 类型实现 `Summary` 特征，因为 `Summary` 定义在当前作用域中。
>
> 但是你无法在当前作用域中，为 `String` 类型实现 `Display` 特征，因为它们俩都定义在标准库中，其定义所在的位置都不在当前作用域，跟你半毛钱关系都没有，看看就行了。
>
> 该规则被称为 **孤儿规则**，可以确保其它人编写的代码不会破坏你的代码，也确保了你不会莫名其妙就破坏了风马牛不相及的代码。

#### 默认实现

你可以在特征中定义具有 **默认实现** 的方法，这样其它类型无需再实现该方法，或者也可以选择重载该方法：

``` rust

pub trait Summary {
    fn summarize(&self) -> String {
        String:: from("(Read more...)")
    }
}

impl Summary for Post {}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}

    println!("{}", post.summarize());
    println!("{}", weibo.summarize());
(Read more...)
sunface 发表了微博好像微博没 Tweet 好用

```

### 使用特征作为函数参数

``` rust
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

`impl Summary`，只能说想出这个类型的人真的是起名鬼才，简直太贴切了，顾名思义，它的意思是 **实现了 `Summary` 特征** 的 `item` 参数。

你可以使用任何实现了 `Summary` 特征的类型作为该函数的参数，同时在函数体内，还可以调用该特征的方法，例如 `summarize` 方法。具体的说，可以传递 `Post` 或 `Weibo` 的实例来作为参数，而其它类如 `String` 或者 `i32` 的类型则不能用做该函数的参数，因为它们没有实现 `Summary` 特征。

### 特征约束

``` rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {}

```



如果函数两个参数是不同的类型，那么上面的方法很好，只要这两个类型都实现了 `Summary` 特征即可。但是如果我们想要强制函数的两个参数是同一类型呢？上面的语法就无法做到这种限制，此时我们只能使特征约束来实现：

``` rust
pub fn notify <T: Summary>(item1: &T, item2: &T) {}
```

泛型类型 `T` 说明了 `item1` 和 `item2` 必须拥有同样的类型，同时 `T: Summary` 说明了 `T` 必须实现 `Summary` 特征。

#### 多重约束

除了单个约束条件，我们还可以指定多个约束条件，例如除了让参数实现 `Summary` 特征外，还可以让参数实现 `Display` 特征以控制它的格式化输出：

``` rust
pub fn notify(item: &(impl Summary + Display)) {}
//除了上述的语法糖形式，还能使用特征约束的形式：
pub fn notify <T: Summary + Display>(item: &T) {}

```

#### Where 约束

当特征约束变得很多时，函数的签名将变得很复杂：

``` rust
fn some_function <T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {}
//where
fn some_function <T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}

```

#### 使用特征约束有条件地实现方法或特征

``` rust
use std::fmt:: Display;

struct Pair <T> {
    x: T,
    y: T,
}

impl <T> Pair <T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

impl <T: Display + PartialOrd> Pair <T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}

```

`mp_display` 方法，并不是所有的 `Pair<T>` 结构体对象都可以拥有，只有 `T` 同时实现了 `Display + PartialOrd` 的 `Pair<T>` 才可以拥有此方法。 该函数可读性会更好，因为泛型参数、参数、返回值都在一起，可以快速的阅读，同时每个泛型参数的特征也在新的代码行中通过 **特征约束** 进行了约束。

### 函数返回中的 impl Trait

``` rust
fn returns_summarizable() -> impl Summary {
    Weibo {
        username: String:: from("sunface"),
        content: String:: from(
            "m1 max 太厉害了，电脑再也不会卡",
        )
    }
}

```

### 通过 derive 派生特征

例如 `Debug` 特征，它有一套自动实现的默认代码，当你给一个结构体标记后，就可以使用 `println!("{:?}", s)` 的形式打印该结构体的对象。

再如 `Copy` 特征，它也有一套自动实现的默认代码，当标记到一个类型上时，可以让这个类型自动实现 `Copy` 特征，进而可以调用 `copy` 方法，进行自我复制。

总之，`derive` 派生出来的是 Rust 默认给我们提供的特征，在开发过程中极大的简化了自己手动实现相应特征的需求，当然，如果你有特殊的需求，还可以自己手动重载该实现。

## 特征对象

``` rust
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        Post {
           // ...
        }
    } else {
        Weibo {
            // ...
        }
    }
}
```

其中 `Post` 和 `Weibo` 都实现了 `Summary` 特征，因此上面的函数试图通过返回 `impl Summary` 来返回这两个类型，但是编译器却无情地报错了，<span style="color:#FF3333;">原因是 impl Trait 的返回值类型并不支持多种不同的类型返回</span>，那如果我们想返回多种类型, 使用特征对象。

### 特征对象

特征对象指向实现了 Draw 特征的类型的实例，也就是指向了 Button 或者 SelectBox 的实例，这种映射关系是存储在一张表中，可以在运行时通过特征对象找到具体调用的类型方法。

> [!NOTE]
>
> 可以通过 & 引用或者 Box <T> 智能指针的方式来创建特征对象。

``` rust
trait Draw {
    fn draw(&self) -> String;
}

impl Draw for u8 {
    fn draw(&self) -> String {
        format!("u8: {}", *self)
    }
}

impl Draw for f64 {
    fn draw(&self) -> String {
        format!("f64: {}", *self)
    }
}

// 若 T 实现了 Draw 特征， 则调用该函数时传入的 Box <T> 可以被隐式转换成函数参数签名中的 Box <dyn Draw>
fn draw1(x: Box <dyn Draw>) {
    // 由于实现了 Deref 特征，Box 智能指针会自动解引用为它所包裹的值，然后调用该值对应的类型上定义的 `draw` 方法
    x.draw();
}

fn draw2(x: &dyn Draw) {
    x.draw();
}

fn main() {
    let x = 1.1f64;
    // do_something(&x);
    let y = 8u8;

    // x 和 y 的类型 T 都实现了 `Draw` 特征，因为 Box <T> 可以在函数调用时隐式地被转换为特征对象 Box <dyn Draw> 
    // 基于 x 的值创建一个 Box <f64> 类型的智能指针，指针指向的数据被放置在了堆上
    draw1(Box:: new(x));
    // 基于 y 的值创建一个 Box <u8> 类型的智能指针
    draw1(Box:: new(y));
    draw2(&x);
    draw2(&y);
}
```

上面代码，有几个非常重要的点：

- `draw1` 函数的参数是 `Box<dyn Draw>` 形式的特征对象，该特征对象是通过 `Box::new(x)` 的方式创建的
- `draw2` 函数的参数是 `&dyn Draw` 形式的特征对象，该特征对象是通过 `&x` 的方式创建的
- `dyn` 关键字只用在特征对象的类型声明上，在创建时无需使用 `dyn`

### 特征对象的动态分发

泛型是在编译期完成处理的：编译器会为每一个泛型参数对应的具体类型生成一份代码，这种方式是 **静态分发(static dispatch)**，因为是在编译期完成的，对于运行期性能完全没有任何影响。

与静态分发相对应的是 **动态分发(dynamic dispatch)**，在这种情况下，直到运行时，才能确定需要调用什么方法。之前代码中的关键字 `dyn` 正是在强调这一“动态”的特点。

当使用特征对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于特征对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用特征对象中的指针来知晓需要调用哪个方法。动态分发也阻止编译器有选择的内联方法代码，这会相应的禁用一些优化。

![动静态分发(rust)](https://source.wjwsm.top/%E5%8A%A8%E9%9D%99%E6%80%81%E5%88%86%E5%8F%91(rust).jpg)

- **特征对象大小不固定**：这是因为，对于特征 `Draw`，类型 `Button` 可以实现特征 `Draw`，类型 `SelectBox` 也可以实现特征 `Draw`，因此特征没有固定大小

- 几乎总是使用特征对象的引用方式

  ，如 `dyn DrawBox`, `<dyn Draw>`

  - 虽然特征对象没有固定大小，但它的引用类型的大小是固定的，它由两个指针组成（`ptr` 和 `vptr`），因此占用两个指针大小
  - 一个指针 `ptr` 指向实现了特征 `Draw` 的具体类型的实例，也就是当作特征 `Draw` 来用的类型的实例，比如类型 `Button` 的实例、类型 `SelectBox` 的实例
  - 另一个指针 `vptr` 指向一个虚表 `vtable`，`vtable` 中保存了类型 `Button` 或类型 `SelectBox` 的实例对于可以调用的实现于特征 `Draw` 的方法。当调用方法时，直接从 `vtable` 中找到方法并调用。之所以要使用一个 `vtable` 来保存各实例的方法，是因为实现了特征 `Draw` 的类型有多种，这些类型拥有的方法各不相同，当将这些类型的实例都当作特征 `Draw` 来使用时(此时，它们全都看作是特征 `Draw` 类型的实例)，有必要区分这些实例各自有哪些方法可调用

简而言之，当类型 `Button` 实现了特征 `Draw` 时，类型 `Button` 的实例对象 `btn` 可以当作特征 `Draw` 的特征对象类型来使用，`btn` 中保存了作为特征对象的数据指针（指向类型 `Button` 的实例数据）和行为指针（指向 `vtable`）。

一定要注意，此时的 `btn` 是 `Draw` 的特征对象的实例，而不再是具体类型 `Button` 的实例，而且 `btn` 的 `vtable` 只包含了实现自特征 `Draw` 的那些方法（比如 `draw`），因此 `btn` 只能调用实现于特征 `Draw` 的 `draw` 方法，而不能调用类型 `Button` 本身实现的方法和类型 `Button` 实现于其他特征的方法。**也就是说，`btn` 是哪个特征对象的实例，它的 `vtable` 中就包含了该特征的方法。**

> [!INFO]
>
> 也就是说当作为特征对象的时候, 无法使用自身类的方法?只能使用特征的方法

### Self 与 self

[Self 详解](#self)

在 Rust 中，有两个 self，一个指代当前的实例对象，一个指代特征或者方法类型的别名：

``` rust
trait Draw {
    fn draw(&self) -> Self;
}

#[derive(Clone)]
struct Button;
impl Draw for Button {
    fn draw(&self) -> Self {
        return self.clone()
    }
}

fn main() {
    let button = Button;
    let newb = button.draw();
}
\\上述代码中，self 指代的就是当前的实例对象，也就是 button.draw() 中的 button 实例，Self 则指代的是 Button 类型。
```

### 特征对象的限制

不是所有特征都能拥有特征对象，只有对象安全的特征才行。当一个特征的所有方法都有如下属性时，它的对象才是安全的：

- 方法的返回类型不能是 `Self`
- 方法没有任何泛型参数

对象安全对于特征对象是必须的，因为一旦有了特征对象，就不再需要知道实现该特征的具体类型是什么了。如果特征方法返回了具体的 `Self` 类型，但是特征对象忘记了其真正的类型，那这个 `Self` 就非常尴尬，因为没人知道它是谁了。但是对于泛型类型参数来说，当使用特征时其会放入具体的类型参数：此具体类型变成了实现该特征的类型的一部分。而当使用特征对象时其具体类型被抹去了，故而无从得知放入泛型参数类型到底是什么。

## 深入了解特征

#### 关联类型

关联类型是在特征定义的语句块中，申明一个自定义类型，这样就可以在特征的方法签名中使用该类型：

``` rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option <Self::Item>;
}

```

同时，`next` 方法也返回了一个 `Item` 类型，不过使用 `Option` 枚举进行了包裹，假如迭代器中的值是 `i32` 类型，那么调用 `next` 方法就将获取一个 `Option<i32>` 的值。

还记得 `Self` 吧？在之前的章节 [提到过](#self)， **`Self` 用来指代当前调用者的具体类型，那么 `Self::Item` 就用来指代该类型实现中定义的 `Item` 类型**：

#### 默认泛型类型参数

当使用泛型类型参数时，可以为其指定一个默认的具体类型，例如标准库中的 std::ops:: Add 特征：

```rust
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}

```

它有一个泛型参数 RHS，但是与我们以往的用法不同，这里它给 RHS 一个默认值，也就是当用户不指定 RHS 时，默认使用两个同样类型的值进行相加，然后返回一个关联类型 Output。

#### 调用同名的方法

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

```

##### 优先调用类型上的方法

当调用 Human 实例的 fly 时，编译器默认调用该类型中定义的方法：

```rustfn main() {
    let person = Human;
    person.fly();
}
```

##### 调用特征上的方法

为了能够调用两个特征的方法，需要使用显式调用的语法：

```rust
fn main() {
    let person = Human;
    Pilot::fly(&person); // 调用Pilot特征上的方法
    Wizard::fly(&person); // 调用Wizard特征上的方法
    person.fly(); // 调用Human类型自身的方法
}
```

<span style="color:#FF3333;"> 因为 `fly` 方法的参数是 `self`，当显式调用时，编译器就可以根据调用的类型( `self` 的类型)决定具体调用哪个方法。</span>

###### 没有 self 参数

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Dog::baby_name());
}
```

需要使用完全限定语法。

```rust
fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```

在尖括号中，通过 as 关键字，我们向 Rust 编译器提供了类型注解，也就是 Animal 就是 Dog，而不是其他动物，因此最终会调用 impl Animal for Dog 中的方法，获取到其它动物对狗宝宝的称呼：puppy。

### 特征定义中的特征约束

我们会需要让某个特征 A 能使用另一个特征 B 的功能(另一种形式的特征约束)，这种情况下，不仅仅要为类型实现特征 A，还要为类型实现特征 B 才行，这就是基特征( super trait )。

```rust
use std::fmt:: Display;

trait OutlinePrint: Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

```



例如有一个特征 OutlinePrint，它有一个方法，能够对当前的实现类型进行格式化输出：

如果你想要实现 OutlinePrint 特征，首先你需要实现 Display 特征。

### 在外部类型上实现外部特征(newtype)

在特征章节中，有提到孤儿规则，简单来说，就是特征或者类型必需至少有一个是本地的，才能在此类型上定义特征。

这里提供一个办法来绕过孤儿规则，那就是使用 **newtype 模式**，简而言之：就是为一个元组结构体创建新类型。该元组结构体封装有一个字段，该字段就是希望实现特征的具体类型。

该封装类型是本地的，因此我们可以为此类型实现外部的特征。

我们有一个动态数组类型： Vec <T>，它定义在标准库中，还有一个特征 Display，它也定义在标准库中，如果没有 newtype，我们是无法为 Vec <T> 实现 Display 的：

``` rust
use std:: fmt;

struct Wrapper(Vec <String>);

impl fmt:: Display for Wrapper {
    fn fmt(&self, f: &mut fmt:: Formatter) -> fmt:: Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec! [String:: from("hello"), String:: from("world")]);
    println!("w = {}", w);
}
```

其中，struct Wrapper(Vec <String>) 就是一个元组结构体，它定义了一个新类型 Wrapper，代码很简单，相信大家也很容易看懂。

既然 new type 有这么多好处，它有没有不好的地方呢？答案是肯定的。注意到我们怎么访问里面的数组吗？self.0.join(", ")，是的，很啰嗦，因为需要先从 Wrapper 中取出数组: self.0，然后才能执行 join 方法。

# 集合类型

## 动态数组 Vector

动态数组允许你存储多个值，这些值在内存中一个紧挨着另一个排列，因此访问其中某个元素的成本非常低。动态数组只能存储相同类型的元素，如果你想存储不同类型的元素，可以使用之前讲过的枚举类型或者特征对象。

### 创建动态数组

`Vec::new`

``` rust
let v: Vec <i32> = Vec:: new();
let v = vec! [1, 2, 3];

```

### 更新 Vector

向数组尾部添加元素，可以使用 `push` 方法：

``` rust
let mut v = Vec:: new();
v.push(1);

```

### 从 Vector 中读取元素

读取指定位置的元素有两种方式可选：

- 通过下标索引访问。
- 使用 `get` 方法。

``` rust

let v = vec! [1, 2, 3, 4, 5];

let third: &i32 = &v [2];
println!("第三个元素是 {}", third);

match v.get(2) {
    Some(third) => println!("第三个元素是 {third}"),
    None => println!("去你的第三个元素，根本没有！"),
}

```

### 迭代遍历 Vector 中的元素

``` rust
let v = vec! [1, 2, 3];
for i in &v {
    println!("{i}");
}

let mut v = vec! [1, 2, 3];
for i in &mut v {
    *i += 10
}

```

### 存储不同类型的元素

在实际使用场景中，特征对象数组要比枚举数组常见很多，主要原因在于特征对象非常灵活，而编译器对枚举的限制较多，且无法动态增加类型。

``` rust
trait IpAddr {
    fn display(&self);
}

struct V4(String);
impl IpAddr for V4 {
    fn display(&self) {
        println!("ipv4: {:?}", self.0)
    }
}
struct V6(String);
impl IpAddr for V6 {
    fn display(&self) {
        println!("ipv6: {:?}", self.0)
    }
}

fn main() {
    let v: Vec <Box<dyn IpAddr> > = vec![
        Box:: new(V4("127.0.0.1".to_string())),
        Box:: new(V6(":: 1".to_string())),
    ];

    for ip in v {
        ip.display();
    }
}
```

### Vector 常用方法

``` rust
let mut v =  vec! [1, 2];
assert!(! v.is_empty());         // 检查 v 是否为空

v.insert(2, 3);                 // 在指定索引插入数据，索引值不能大于 v 的长度， v: [1, 2, 3] 
assert_eq!(v.remove(1), 2);     // 移除指定位置的元素并返回, v: [1, 3]
assert_eq!(v.pop(), Some(3));   // 删除并返回 v 尾部的元素，v: [1]
assert_eq!(v.pop(), Some(1));   // v: []
assert_eq!(v.pop(), None);      // 记得 pop 方法返回的是 Option 枚举值
v.clear();                      // 清空 v, v: []

let mut v1 = [11, 22].to_vec(); // append 操作会导致 v1 清空数据，增加可变声明
v.append(&mut v1);              // 将 v1 中的所有元素附加到 v 中, v1: []
v.truncate(1);                  // 截断到指定长度，多余的元素被删除, v: [11]
v.retain(|x| *x > 10);          // 保留满足条件的元素，即删除不满足条件的元素

let mut v = vec! [11, 22, 33, 44, 55];
// 删除指定范围的元素，同时获取被删除元素的迭代器, v: [11, 55], m: [22, 33, 44]
let mut m: Vec <_> = v.drain(1..= 3).collect();    

let v2 = m.split_off(1);        // 指定索引处切分成两个 vec, m: [22], v2: [33, 44]

```

#### Vector 的排序

在 rust 里，实现了两种排序算法，分别为稳定的排序 `sort` 和 `sort_by`，以及非稳定排序 `sort_unstable` 和 `sort_unstable_by`。

``` rust
fn main() {
    let mut vec = vec! [1, 5, 10, 2, 15];    
    vec.sort_unstable();    
    assert_eq!(vec, vec! [1, 2, 5, 10, 15]);
}
```

原来，在浮点数当中，存在一个 `NAN` 的值，这个值无法与其他的浮点数进行对比，因此，浮点数类型并没有实现全数值可比较 `Ord` 的特性，而是实现了部分可比较的特性 `PartialOrd`。

如此，如果我们确定在我们的浮点数数组当中，不包含 `NAN` 值，那么我们可以使用 `partial_cmp` 来作为大小判断的依据。

## KV 存储 HashMap

### 创建 HashMap

``` rust
use std::collections:: HashMap;

// 创建一个 HashMap，用于存储宝石种类和对应的数量
let mut my_gems = HashMap:: new();

// 将宝石类型和对应的数量写入表中
my_gems.insert("红宝石", 1);
my_gems.insert("蓝宝石", 2);
my_gems.insert("河边捡的误以为是宝石的破石头", 18);

```

### 使用迭代器和 collect 方法创建

Rust 为我们提供了一个非常精妙的解决办法：先将 `Vec` 转为迭代器，接着通过 `collect` 方法，将迭代器中的元素收集后，转成 `HashMap`：

``` rust
fn main() {
    use std::collections:: HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(), 10),
        ("日本队".to_string(), 50),
    ];

    let teams_map: HashMap <_,_> = teams_list.into_iter().collect();
    
    println!("{:?}", teams_map)
}
```

### 所有权转移

`HashMap` 的所有权规则与其它 Rust 类型没有区别：

- 若类型实现 `Copy` 特征，该类型会被复制进 `HashMap`，因此无所谓所有权
- 若没实现 `Copy` 特征，所有权将被转移给 `HashMap` 中

### 查询 HashMap

``` rust
use std::collections:: HashMap;

let mut scores = HashMap:: new();

scores.insert(String:: from("Blue"), 10);
scores.insert(String:: from("Yellow"), 50);

let team_name = String:: from("Blue");
let score: Option <&i32> = scores.get(&team_name);

```



- `get` 方法返回一个 `Option<&i32>` 类型：当查询不到时，会返回一个 `None`，查询到时返回 `Some(&i32)`
- `&i32` 是对 `HashMap` 中值的借用，如果不使用借用，可能会发生所有权的转移

### 更新 HashMap 中的值

``` rust
fn main() {
    use std::collections:: HashMap;

    let mut scores = HashMap:: new();

    scores.insert("Blue", 10);

    // 覆盖已有的值
    let old = scores.insert("Blue", 20);
    assert_eq!(old, Some(10));

    // 查询新插入的值
    let new = scores.get("Blue");
    assert_eq!(new, Some(&20));

    // 查询 Yellow 对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(5);
    assert_eq!(*v, 5); // 不存在，插入 5

    // 查询 Yellow 对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(50);
    assert_eq!(*v, 5); // 已经存在，因此 50 没有插入
}
```

- `or_insert` 返回了 `&mut v` 引用，因此可以通过该可变引用直接修改 `map` 中对应的值
- 使用 `count` 引用时，需要先进行解引用 `*count`，否则会出现类型不匹配

# <span style="color:#990000;">生命周期</span>

## 为什么需要生命周期?

Rust 中的生命周期标注是编译器用来保证内存安全的工具之一。由于 Rust 采用了所有权系统来管理内存，因此它必须追踪和检查引用（`&`）的生命周期，以确保不会出现悬空指针（dangling pointers）或数据竞争（data races）等内存安全问题。生命周期标注帮助编译器理解引用的有效期，确保程序的内存不会被错误地访问或释放。

**防止悬空指针（Dangling Pointers）**

- **悬空指针** 是指向已经被释放或不再有效内存的引用。如果一个引用的生命周期比它所指向的对象长，那么该引用就变成了悬空指针，访问它会导致未定义行为。
- Rust 通过生命周期标注明确表示一个引用有效的范围，从而防止这种情况发生。

**防止数据竞争（Data Races）**

- Rust 通过所有权（Ownership）和借用（Borrowing）机制确保没有数据竞争。借用可以是 **可变借用** 或 **不可变借用**，而生命周期标注帮助编译器理解这些借用的有效期，避免在同一时间对数据进行可变和不可变借用。
- 如果两个借用在同一时间同时访问数据，而其中一个是可变借用，那么这可能会导致数据竞争。生命周期标注帮助 Rust 确保这种情况不会发生。

**明确引用的有效期**

- 在某些情况下，Rust 无法自动推断引用的生命周期。例如，某些方法接受多个引用参数，而这些引用可能有不同的生命周期。在这种情况下，显式标注生命周期可以帮助编译器理解这些引用的相对关系和它们的有效期，从而避免错误。
- 显式标注生命周期使得编程人员能够清楚地描述不同引用之间的生命周期关系。例如，方法的返回值引用可能依赖于输入参数的生命周期，生命周期标注可以使这些依赖关系更加明确。

**提高内存效率**

- Rust 通过生命周期标注，能够对内存进行更细粒度的管理。没有生命周期标注，Rust 需要执行更多的推断来确定引用是否有效，显式的生命周期标注可以减少编译器的工作量，并且确保内存的使用更加高效和安全。

## 生命周期标注语法

``` rust
&i32        // 一个引用
&'a i32     // 具有显式生命周期的引用
&'a mut i32 // 具有显式生命周期的可变引用

```

一个生命周期标注，它自身并不具有什么意义，因为生命周期的作用就是告诉编译器多个引用之间的关系。例如，有一个函数，它的第一个参数 `first` 是一个指向 `i32` 类型的引用，具有生命周期 `'a`，该函数还有另一个参数 `second`，它也是指向 `i32` 类型的引用，并且同样具有生命周期 `'a`。此处生命周期标注仅仅说明，**这两个参数 `first` 和 `second` 至少活得和'a 一样久，至于到底活多久或者哪个活得更久，抱歉我们都无法得知**：

``` rust
fn useless <'a>(first: &'a i32, second: &'a i32) {}
```

### 函数签名中的生命周期标注

``` rust
fn longest <'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

```

- 和泛型一样，使用生命周期参数，需要先声明 `<'a>`
- `x`、`y` 和返回值至少活得和 `'a` 一样久（因为返回值要么是 `x`，要么是 `y`）

### 深入思考生命周期标注

**函数的返回值如果是一个引用类型，那么它的生命周期只会来源于**：

- 函数参数的生命周期
- 函数体中某个新建引用的生命周期

若是后者情况，就是典型的悬垂引用场景：

``` rust
fn longest <'a>(x: &str, y: &str) -> &'a str {
    let result = String:: from("really long string");
    result.as_str()
}

```

### 结构体中的生命周期

``` rust
struct ImportantExcerpt <'a> {
    part: &'a str,
}

fn main() {
    let novel = String:: from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

`ImportantExcerpt` 结构体中有一个引用类型的字段 `part`，因此需要为它标注上生命周期。结构体的生命周期标注语法跟泛型参数语法很像，需要对生命周期参数进行声明 `<'a>`。该生命周期标注说明，**结构体 `ImportantExcerpt` 所引用的字符串 `str` 生命周期需要大于等于该结构体的生命周期**。

从 `main` 函数实现来看，`ImportantExcerpt` 的生命周期从第 4 行开始，到 `main` 函数末尾结束，而该结构体引用的字符串从第一行开始，也是到 `main` 函数末尾结束，可以得出结论 **结构体引用的字符串生命周期大于等于结构体**，这符合了编译器对生命周期的要求，因此编译通过。

### 生命周期消除

**编译器为了简化用户的使用，运用了生命周期消除大法**。

在开始之前有几点需要注意：

- 消除规则不是万能的，若编译器不能确定某件事是正确时，会直接判为不正确，那么你还是需要手动标注生命周期
- **函数或者方法中，参数的生命周期被称为 `输入生命周期`，返回值的生命周期被称为 `输出生命周期`**

#### 三条消除规则

1. **每一个引用参数都会获得独自的生命周期**

   例如一个引用参数的函数就有一个生命周期标注: `fn foo<'a>(x: &'a i32)`，两个引用参数的有两个生命周期标注: `fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`, 依此类推。

2. **若只有一个输入生命周期（函数参数中只有一个引用类型），那么该生命周期会被赋给所有的输出生命周期**，也就是所有返回值的生命周期都等于该输入生命周期

   例如函数 `fn foo(x: &i32) -> &i32`，`x` 参数的生命周期会被自动赋给返回值 `&i32`，因此该函数等同于 `fn foo<'a>(x: &'a i32) -> &'a i32`

3. **若存在多个输入生命周期，且其中一个是 `&self` 或 `&mut self`，则 `&self` 的生命周期被赋给所有的输出生命周期**

### 方法中的生命周期

``` rust
struct Point <T> {
    x: T,
    y: T,
}

impl <T> Point <T> {
    fn x(&self) -> &T {
        &self.x
    }
}

```

``` rust
impl <'a: 'b, 'b> ImportantExcerpt <'a> {
    fn announce_and_return_part(&'a self, announcement: &'b str) -> &'b str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

- `'a: 'b`，是生命周期约束语法，跟泛型约束非常相似，用于说明 `'a` 必须比 `'b` 活得久
- 可以把 `'a` 和 `'b` 都在同一个地方声明（如上），或者分开声明但通过 `where 'a: 'b` 约束生命周期关系，如下：

``` rust
struct ImportantExcerpt <'a> {
    part: &'a str,
}

impl <'a> ImportantExcerpt <'a> {
    fn announce_and_return_part <'b>(&'a self, announcement: &'b str) -> &'b str
    where
        'a: 'b,
    {
        println!("Attention please: {}", announcement);
        self.part
    }
}

```

### 静态生命周期

**在 Rust 中有一个非常特殊的生命周期，那就是 `'static`，拥有该生命周期的引用可以和整个程序活得一样久。**

``` rust
let s: &'static str = "我没啥优点，就是活得久，嘿嘿";

```

- 生命周期 `'static` 意味着能和程序活得一样久，例如字符串字面量和特征对象
- 实在遇到解决不了的生命周期标注问题，可以尝试 `T: 'static`，有时候它会给你奇迹

# 返回值和错误处理

## Rust 的错误哲学

Rust 中的错误主要分为两类：

- **可恢复错误**，通常用于从系统全局角度来看可以接受的错误，例如处理用户的访问、操作等错误，这些错误只会影响某个用户自身的操作进程，而不会对系统的全局稳定性产生影响
- **不可恢复错误**，刚好相反，该错误通常是全局性或者系统性的错误，例如数组越界访问，系统启动时发生了影响启动流程的错误等等，这些错误的影响往往对于系统来说是致命的

### panic 深入剖析

#### panic! 与不可恢复错误

对于这些严重到影响程序运行的错误，触发 `panic` 是很好的解决方式。在 Rust 中触发 `panic` 有两种方式：被动触发和主动调用，下面依次来看看。

+ 被动触发 数组越界

+ 主动调用 

  对此，Rust 为我们提供了 `panic!` 宏，当调用执行该宏时，**程序会打印出一个错误信息，展开报错点往前的函数调用堆栈，最后退出程序**。

> [!INFO]
>
> 切记，一定是不可恢复的错误，才调用 `panic!` 处理，你总不想系统仅仅因为用户随便传入一个非法参数就崩溃吧？所以，**只有当你不知道该如何处理时，再去调用 panic!**.

#### panic 时的两种终止方式

当出现 `panic!` 时，程序提供了两种方式来处理终止流程：**栈展开** 和 **直接终止**。

其中，默认的方式就是 `栈展开`，这意味着 Rust 会回溯栈上数据和函数调用，因此也意味着更多的善后工作，好处是可以给出充分的报错信息和栈调用信息，便于事后的问题复盘。`直接终止`，顾名思义，不清理数据就直接退出程序，善后工作交与操作系统来负责。

对于绝大多数用户，使用默认选择是最好的，但是当你关心最终编译出的二进制可执行文件大小时，那么可以尝试去使用直接终止的方式，例如下面的配置修改 `Cargo.toml` 文件，实现在 [`release`](https://course.rs/first-try/cargo.html#手动编译和运行项目) 模式下遇到 `panic` 直接终止：



``` to
[profile.release]
panic = 'abort'

```

#### 线程 panic 后，程序是否会终止？

长话短说，如果是 `main` 线程，则程序会终止，如果是其它子线程，该线程会终止，但是不会影响 `main` 线程。因此，尽量不要在 `main` 线程中做太多任务，将这些任务交由子线程去做，就算子线程 `panic` 也不会导致整个程序的结束。

### 可恢复的错误 Result

#### 对返回的错误进行处理

``` rust
use std::fs:: File;
use std::io:: ErrorKind;

fn main() {
    let f = File:: open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind:: NotFound => match File:: create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => panic!("Problem opening the file: {:?}", other_error),
        },
    };
}
```

#### 失败就 panic: unwrap 和 expect

##### `unwrap` 

它们的作用就是，如果返回成功，就将 `Ok(T)` 中的值取出来，如果失败，就直接 `panic`

##### `expect`

也是遇到错误直接 `panic`, 但是会带上自定义的错误提示信息，相当于重载了错误打印的函数：

#### 传播界的大明星: ?

``` rust
use std::fs:: File;
use std:: io;
use std::io:: Read;

fn read_username_from_file() -> Result <String, io::Error> {
    let mut f = File:: open("hello.txt")?;
    let mut s = String:: new();
    f.read_to_string(&mut s)?;
    Ok(s)
}

```

如果结果是 `Ok(T)`，则把 `T` 赋值给 `f`，如果结果是 `Err(E)`，则返回该错误，所以 `?` 特别适合用来传播错误。

虽然 `?` 和 `match` 功能一致，但是事实上 `?` 会更胜一筹。何解？

标准库中的 `std::io:: Error ` 和 ` std::error:: Error `，前者是 IO 相关的错误结构体，后者是一个最最通用的标准错误特征，同时前者实现了后者，因此 ` std::io:: Error ` 可以转换为 ` std:error:: Error`。

明白了以上的错误转换，`?` 的更胜一筹就很好理解了，它可以自动进行类型提升（转换）：

##### ? 用于 Option 的返回

`?` 不仅仅可以用于 `Result` 的传播，还能用于 `Option` 的传播，再来回忆下 `Option` 的定义：

```rust
pub enum Option<T> {
    Some(T),
    None
}

```

`Result` 通过 `?` 返回错误，那么 `Option` 就通过 `?` 返回 `None`：

```rust
fn first(arr: &[i32]) -> Option<&i32> {
   let v = arr.get(0)?;
   Some(v)
}

```

上面的函数中，`arr.get` 返回一个 `Option<&i32>` 类型，因为 `?` 的使用，如果 `get` 的结果是 `None`，则直接返回 `None`，如果是 `Some(&i32)`，则把里面的值赋给 `v`。

##### 新手用 ? 常会犯的错误

```rust
fn first(arr: &[i32]) -> Option<&i32> {
   arr.get(0)?
}
```

这段代码无法通过编译，切记：`?` 操作符需要一个变量来承载正确的值，这个函数只会返回 `Some(&i32)` 或者 `None`，只有错误值能直接返回，正确的值不行，所以如果数组中存在 0 号元素，那么函数第二行使用 `?` 后的返回类型为 `&i32` 而不是 `Some(&i32)`。因此 `?` 只能用于以下形式：

- `let v = xxx()?;`
- `xxx()?.yyy()?;`

# 格式化输出

## `print!`，`println!`，`format!`

它们是 Rust 中用来格式化输出的三大金刚，用途如下：

- `print!` 将格式化文本输出到标准输出，不带换行符
- `println!` 同上，但是在行的末尾添加换行符
- `format!` 将格式化文本输出到 `String` 字符串

## {} 与

与其它语言常用的 `%d`，`%s` 不同，Rust 特立独行地选择了 `{}` 作为格式化占位符（说到这个，有点想吐槽下，Rust 中自创的概念其实还挺多的，真不知道该夸奖还是该吐槽-,-），事实证明，这种选择非常正确，它帮助用户减少了很多使用成本，你无需再为特定的类型选择特定的占位符，统一用 `{}` 来替代即可，剩下的类型推导等细节只要交给 Rust 去做。

与 `{}` 类似，`{:?}` 也是占位符：

- `{}` 适用于实现了 `std::fmt:: Display` 特征的类型，用来以更优雅、更友好的方式格式化文本，例如展示给用户
- `{:?}` 适用于实现了 `std::fmt:: Debug` 特征的类型，用于调试场景

其实两者的选择很简单，当你在写代码需要调试时，使用 `{:?}`，剩下的场景，选择 `{}`。

### `Debug` 特征

事实上，为了方便我们调试，大多数 Rust 类型都实现了 `Debug` 特征或者支持派生该特征：

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u8
}

fn main() {
    let i = 3.1415926;
    let s = String::from("hello");
    let v = vec![1, 2, 3];
    let p = Person{name: "sunface".to_string(), age: 18};
    println!("{:?}, {:?}, {:?}, {:?}", i, s, v, p);
}
```

对于数值、字符串、数组，可以直接使用 `{:?}` 进行输出，但是对于结构体，需要派生 `Debug` 特征后，才能进行输出，总之很简单。

### `Display` 特征

与大部分类型实现了 `Debug` 不同，实现了 `Display` 特征的 Rust 类型并没有那么多，往往需要我们自定义想要的格式化方式：

```rust
let i = 3.1415926;
let s = String::from("hello");
let v = vec![1, 2, 3];
let p = Person {
    name: "sunface".to_string(),
    age: 18,
};
println!("{}, {}, {}, {}", i, s, v, p);
```

运行后可以看到 `v` 和 `p` 都无法通过编译，因为没有实现 `Display` 特征，但是你又不能像派生 `Debug` 一般派生 `Display`，只能另寻他法：

- 使用 `{:?}` 或 `{:#?}`
- 为自定义类型实现 `Display` 特征
- 使用 `newtype` 为外部类型实现 `Display` 特征

### 为自定义类型实现 `Display` 特征

如果你的类型是定义在当前作用域中的，那么可以为其实现 `Display` 特征，即可用于格式化输出：

```rust
struct Person {
    name: String,
    age: u8,
}

use std::fmt;
impl fmt::Display for Person {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "大佬在上，请受我一拜，小弟姓名{}，年芳{}，家里无田又无车，生活苦哈哈",
            self.name, self.age
        )
    }
}
fn main() {
    let p = Person {
        name: "sunface".to_string(),
        age: 18,
    };
    println!("{}", p);
}
```

如上所示，只要实现 `Display` 特征中的 `fmt` 方法，即可为自定义结构体 `Person` 添加自定义输出：

### 为外部类型实现 `Display` 特征

在 Rust 中，无法直接为外部类型实现外部特征，但是可以使用 [`newtype`](https://course.rs/advance/into-types/custom-type.html#newtype) 解决此问题：

```rust
struct Array(Vec<i32>);

use std::fmt;
impl fmt::Display for Array {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "数组是：{:?}", self.0)
    }
}
fn main() {
    let arr = Array(vec![1, 2, 3]);
    println!("{}", arr);
}
```

`Array` 就是我们的 `newtype`，它将想要格式化输出的 `Vec` 包裹在内，最后只要为 `Array` 实现 `Display` 特征，即可进行格式化输出：

```console
数组是：[1, 2, 3]
```

至此，关于 `{}` 与 `{:?}` 的内容已介绍完毕，下面让我们正式开始格式化输出的旅程。

### 位置参数

```rust
fn main() {
    println!("{}{}", 1, 2); // =>"12"
    println!("{1}{0}", 1, 2); // =>"21"
    // => Alice, this is Bob. Bob, this is Alice
    println!("{0}, this is {1}. {1}, this is {0}", "Alice", "Bob");
    println!("{1}{}{0}{}", 1, 2); // => 2112
}
```



### 具名参数

```rust
fn main() {
    println!("{argument}", argument = "test"); // => "test"
    println!("{name} {}", 1, name = 2); // => "2 1"
    println!("{a} {c} {b}", a = "a", b = 'b', c = 3); // => "a 3 b"
}
```

### 格式化参数

```rust
fn main() {
    let v = 3.1415926;
    // Display => 3.14
    println!("{:.2}", v);
    // Debug => 3.14
    println!("{:.2?}", v);
}
```

#### 字符串填充

```rust
fn main() {
    //-----------------------------------
    // 以下全部输出 "Hello x    !"
    // 为"x"后面填充空格，补齐宽度5
    println!("Hello {:5}!", "x");
    // 使用参数5来指定宽度
    println!("Hello {:1$}!", "x", 5);
    // 使用x作为占位符输出内容，同时使用5作为宽度
    println!("Hello {1:0$}!", 5, "x");
    // 使用有名称的参数作为宽度
    println!("Hello {:width$}!", "x", width = 5);
    //-----------------------------------

    // 使用参数5为参数x指定宽度，同时在结尾输出参数5 => Hello x    !5
    println!("Hello {:1$}!{}", "x", 5);
    // *$ 指代索引为几的参数
}
```

#### 数字填充: 符号和 0



```rust
fn main() {
    // 宽度是5 => Hello     5!
    println!("Hello {:5}!", 5);
    // 显式的输出正号 => Hello +5!
    println!("Hello {:+}!", 5);
    // 宽度5，使用0进行填充 => Hello 00005!
    println!("Hello {:05}!", 5);
    // 负号也要占用一位宽度 => Hello -0005!
    println!("Hello {:05}!", -5);
}
```

#### 对齐

```rust
fn main() {
    // 以下全部都会补齐5个字符的长度
    // 左对齐 => Hello x    !
    println!("Hello {:<5}!", "x");
    // 右对齐 => Hello     x!
    println!("Hello {:>5}!", "x");
    // 居中对齐 => Hello   x  !
    println!("Hello {:^5}!", "x");

    // 对齐并使用指定符号填充 => Hello x&&&&!
    // 指定符号填充的前提条件是必须有对齐字符
    println!("Hello {:&<5}!", "x");
}
```

#### 精度

```rust
fn main() {
    let v = 3.1415926;
    // 保留小数点后两位 => 3.14
    println!("{:.2}", v);
    // 带符号保留小数点后两位 => +3.14
    println!("{:+.2}", v);
    // 不带小数 => 3
    println!("{:.0}", v);
    // 通过参数来设定精度 => 3.1416，相当于{:.4}
    println!("{:.1$}", v, 4);

    let s = "hi我是Sunface孙飞";
    // 保留字符串前三个字符 => hi我
    println!("{:.3}", s);
    // {:.*}接收两个参数，第一个是精度，第二个是被格式化的值 => Hello abc!
    println!("Hello {:.*}!", 3, "abcdefg");
}
```

#### 进制

可以使用 # 号来控制数字的进制输出：

- #b, 二进制
- #o, 八进制
- #x, 小写十六进制
- #X, 大写十六进制
- x, 不带前缀的小写十六进制



```rust
fn main() {
    // 二进制 => 0b11011!
    println!("{:#b}!", 27);
    // 八进制 => 0o33!
    println!("{:#o}!", 27);
    // 十进制 => 27!
    println!("{}!", 27);
    // 小写十六进制 => 0x1b!
    println!("{:#x}!", 27);
    // 大写十六进制 => 0x1B!
    println!("{:#X}!", 27);

    // 不带前缀的十六进制 => 1b!
    println!("{:x}!", 27);

    // 使用0填充二进制，宽度为10 => 0b00011011!
    println!("{:#010b}!", 27);
}
```

#### 指数

```rust
fn main() {
    println!("{:2e}", 1000000000); // => 1e9
    println!("{:2E}", 1000000000); // => 1E9
}
```



# 函数式编程: 闭包、迭代器

## 闭包

闭包是 **一种匿名函数，它可以赋值给变量也可以作为参数传递给其它函数，不同于函数的是，它允许捕获调用者作用域中的值**

```rust
fn main() {
   let x = 1;
   let sum = |y| x + y;

    assert_eq!(3, sum(2));
}
```

最简单的闭包调用

### 使用闭包简化代码

```rust
use std::thread;
use std::time:: Duration;

fn workout(intensity: u32, random_number: u32) {
    let action = || {
        println!("muuuu.....");
        thread:: sleep(Duration:: from_secs(2));
        intensity
    };

    if intensity < 25 {
        println!(
            "今天活力满满，先做 {} 个俯卧撑!",
            action()
        );
        println!(
            "旁边有妹子在看，俯卧撑太 low，再来 {} 组卧推!",
            action()
        );
    } else if random_number == 3 {
        println!("昨天练过度了，今天还是休息下吧！");
    } else {
        println!(
            "昨天练过度了，今天干干有氧，跑步 {} 分钟!",
            action()
        );
    }
}

fn main() {
    // 动作次数
    let intensity = 10;
    // 随机值用来决定某个选择
    let random_number = 7;

    // 开始健身
    workout(intensity, random_number);
}
```

Rust 闭包在形式上借鉴了 `Smalltalk` 和 `Ruby` 语言，与函数最大的不同就是它的参数是通过 `|parm1|` 的形式进行声明，如果是多个参数就 `|param1, param2,...|`， 下面给出闭包的形式定义：

``` rust
|param1, param2,...| {
    语句 1;
    语句 2;
    返回表达式
}
//如果只有一个返回表达式的话，定义可以简化为：
|param1| 返回表达式

```

上例中还有两点值得注意：

- **闭包中最后一行表达式返回的值，就是闭包执行后的返回值**，因此 `action()` 调用返回了 `intensity` 的值 `10`
- `let action = ||...` 只是把闭包赋值给变量 `action`，并不是把闭包执行后的结果赋值给 `action`，因此这里 `action` 就相当于闭包函数，可以跟函数一样进行调用：`action()`

### 闭包的类型推导

rust 是静态语言，因此所有的变量都具有类型，但是得益于编译器的强大类型推导能力，在很多时候我们并不需要显式地去声明类型，但是显然函数并不在此列，必须手动为函数的所有参数和返回值指定类型，原因在于函数往往会作为 API 提供给你的用户，因此你的用户必须在使用时知道传入参数的类型和返回值类型。

与函数相反，闭包并不会作为 API 对外提供，因此它可以享受编译器的类型推导能力，无需标注参数和返回值的类型。

虽然类型推导很好用，但是它不是泛型，**当编译器推导出一种类型后，它就会一直使用该类型**：

### 结构体中的闭包

``` rust
struct Cacher <T>
where
    T: Fn(u32) -> u32,
{
    query: T,
    value: Option <u32>,
}

impl <T> Cacher <T>
where
    T: Fn(u32) -> u32,
{
    fn new(query: T) -> Cacher <T> {
        Cacher {
            query,
            value: None,
        }
    }

    // 先查询缓存值 `self.value`，若不存在，则调用 `query` 加载
    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.query)(arg);
                self.value = Some(v);
                v
            }
        }
    }
}

```

而标准库提供的 `Fn` 系列特征，再结合特征约束，就能很好的解决了这个问题. `T: Fn(u32) -> u32` 意味着 `query` 的类型是 `T`，该类型必须实现了相应的闭包特征 `Fn(u32) -> u32`。

特征 `Fn(u32) -> u32` 从表面来看，就对闭包形式进行了显而易见的限制：**该闭包拥有一个 `u32` 类型的参数，同时返回一个 `u32` 类型的值**。

### 捕获作用域中的值

这是闭包最显著的特征

``` rust
fn main() {
    let x = 4;

    let equal_to_x = |z| z == x;

    let y = 4;

    assert!(equal_to_x(y));
}
```

### 闭包对内存的影响

当闭包从环境中捕获一个值时，会分配内存去存储这些值。对于有些场景来说，这种额外的内存分配会成为一种负担。与之相比，函数就不会去捕获这些环境值，因此定义和使用函数不会拥有这种内存负担。

### 三种 Fn 特征

闭包捕获变量有三种途径，恰好对应函数参数的三种传入方式：`转移所有权、可变借用、不可变借用，因此相应的` `Fn` 特征也有三种：

1. `FnOnce`，该类型的闭包会拿走被捕获变量的所有权。`Once` 顾名思义，说明该闭包只能运行一次：

``` rust
fn fn_once <F>(func: F)
where
    F: FnOnce(usize) -> bool,// F: FnOnce(usize) -> bool + Copy, 使用 copy 规避掉转移所有权 使用拷贝
{
    println!("{}", func(3));
    // println!("{}", func(3)); 
}

fn main() {
    let x = vec! [1, 2, 3];
    fn_once(|z|{z == x.len()})
}
```

2. `FnMut`，它以可变借用的方式捕获了环境中的值，因此可以修改该值：

``` rust
fn main() {
    let mut s = String:: new();

    let update_string =  |str| s.push_str(str);
    &update_string("hello");

    println!("{:?}", s);
}
```

3. `Fn` 特征，它以不可变借用的方式捕获环境中的值 让我们把上面的代码中 `exec` 的 `F` 泛型参数类型修改为 `Fn(&'a str)`：

``` rust
fn main() {
    let s = "hello, ".to_string();

    let update_string =  |str| println!("{},{}", s, str);

    exec(update_string);

    println!("{:?}", s);
}

fn exec <'a, F: Fn(String) -> ()>(f: F)  {
    f("world".to_string())
}
```

### move 和 Fn

在上面，我们讲到了 `move` 关键字对于 `FnOnce` 特征的重要性，但是实际上使用了 `move` 的闭包依然可以使用 `Fn` 或 `FnMut` 特征。

因为，**一个闭包实现了哪种 Fn 特征取决于该闭包如何使用被捕获的变量，而不是取决于闭包如何捕获它们**。`move` 本身强调的就是后者，闭包如何捕获变量：

``` rust
fn main() {
    let s = String:: new();

    let update_string =  move || println!("{}", s);

    exec(update_string);
}

fn exec <F: FnOnce()>(f: F)  {
    f()
}
```

我们在上面的闭包中使用了 `move` 关键字，所以我们的闭包捕获了它，但是由于闭包获取了 `s` 的所有权，因此该闭包实现了 `FnOnce` 的特征。

``` rust
fn main() {
    let s = String:: new();

    let update_string =  move || println!("{}", s);

    exec(update_string);
}

fn exec <F: Fn()>(f: F)  {
    f()
}
```

奇怪， 明明是闭包实现的是 `FnOnce` 的特征， 为什么编译器居然允许 `Fn` 特征通过编译呢？

实际上，一个闭包并不仅仅实现某一种 `Fn` 特征，规则如下：

- <span style="color:#CC0000;">所有的闭包都自动实现了 `FnOnce` 特征，因此任何一个闭包都至少可以被调用一次</span>
- <span style="color:#CC0000;">没有移出所捕获变量的所有权的闭包自动实现了 `FnMut` 特征</span>
- <span style="color:#CC0000;">不需要对捕获变量进行改变的闭包自动实现了 `Fn` 特征</span>

``` rust
fn main() {
    let s = String:: new();

    let update_string =  || println!("{}", s);

    exec(update_string);
    exec1(update_string);
    exec2(update_string);
}

fn exec <F: FnOnce()>(f: F)  {
    f()
}

fn exec1 <F: FnMut()>(mut f: F)  {
    f()
}

fn exec2 <F: Fn()>(f: F)  {
    f()
}
```

上段代码可以通过编译!

闭包只是对 `s` 进行了不可变借用，实际上，它可以适用于任何一种 `Fn` 特征：三个 `exec` 函数说明了一切。

关于第二条规则，有如下示例：

``` rust
fn main() {
    let mut s = String:: new();

    let update_string = |str| -> String {s.push_str(str); s };

    exec(update_string);
}

fn exec <'a, F: FnMut(&'a str) -> String >(mut f: F) {// error 该闭包只实现了 Fnonce
    f("hello");
}
```

> [!IMPORTANT]
>
> 将 `s` 作为返回值返回，Rust 会推断出闭包的返回值类型为 `String`，这意味着闭包的返回是 `s` 的所有权转移。在你的闭包中，由于 `s` 被 **返回**（而不是仅仅修改），Rust 会认为它是“消费”了 `s`，因此自动推断为 `FnOnce`。



``` rust
pub trait Fn <Args> : FnMut <Args> {
    extern "rust-call" fn call(&self, args: Args) -> Self:: Output;
}

pub trait FnMut <Args> : FnOnce <Args> {
    extern "rust-call" fn call_mut(&mut self, args: Args) -> Self:: Output;
}

pub trait FnOnce <Args> {
    type Output;

    extern "rust-call" fn call_once(self, args: Args) -> Self:: Output;
}

```

从特征约束能看出来 `Fn` 的前提是实现 `FnMut`，`FnMut` 的前提是实现 `FnOnce`，因此要实现 `Fn` 就要同时实现 `FnMut` 和 `FnOnce`，这段源码从侧面印证了之前规则的正确性

### 闭包作为函数返回值

``` rust

fn factory(x: i32) -> Box <dyn Fn(i32) -> i32 > {
    let num = 5;

    if x > 1{
        Box:: new(move |x| x + num)
    } else {
        Box:: new(move |x| x - num)
    }
}

```

必须使用特征对象进行类型标注, 否则无法通过编译

## 迭代器

### For 循环与迭代器

数组不是迭代器，为啥咱可以对它的元素进行迭代呢？

简而言之就是数组实现了 `IntoIterator` 特征，Rust 通过 `for` 语法糖，自动把实现了该特征的数组类型转换为迭代器（你也可以为自己的集合类型实现此特征），最终让我们可以直接对一个数组进行迭代

`ntoIterator` 特征拥有一个 `into_iter` 方法，因此我们还可以显式的把数组转换成迭代器：

``` rust
let arr = [1, 2, 3];
for v in arr.into_iter() {
    println!("{}", v);
}

```

### 惰性初始化

在 Rust 中，迭代器是惰性的，意味着如果你不使用它，那么它将不会发生任何事：

``` rust
let v1 = vec! [1, 2, 3];

let v1_iter = v1.iter();

for val in v1_iter {
    println!("{}", val);
}
```

在 `for` 循环之前，我们只是简单的创建了一个迭代器 `v1_iter`，此时不会发生任何迭代行为，只有在 `for` 循环开始后，迭代器才会开始迭代其中的元素，最后打印出来。

<span style="text-decoration:underline;">这种惰性初始化的方式确保了创建迭代器不会有任何额外的性能损耗，其中的元素也不会被消耗，只有使用到该迭代器的时候，一切才开始。</span>

### next 方法

**迭代器之所以成为迭代器，就是因为实现了 `Iterator` 特征**，要实现该特征，最主要的就是实现其中的 `next` 方法，该方法控制如何从集合中取值，最终返回值的类型是 [关联类型](https://course.rs/basic/trait/advance-trait#关联类型) `Item`

``` rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option <Self::Item>;

    // 省略其余有默认实现的方法
}

```



- `next` 方法返回的是 `Option` 类型，当有值时返回 `Some(i32)`，无值时返回 `None`
- 遍历是按照迭代器中元素的排列顺序依次进行的，因此我们严格按照数组中元素的顺序取出了 `Some(1)`，`Some(2)`，`Some(3)`
- 手动迭代必须将迭代器声明为 `mut` 可变，因为调用 `next` 会改变迭代器其中的状态数据（当前遍历的位置等），而 `for` 循环去迭代则无需标注 `mut`，因为它会帮我们自动完成

``` rust
fn main() {
    let arr = [1, 2, 3];
    let mut arr_iter = arr.into_iter();

    assert_eq!(arr_iter.next(), Some(1));
    assert_eq!(arr_iter.next(), Some(2));
    assert_eq!(arr_iter.next(), Some(3));
    assert_eq!(arr_iter.next(), None);
}
```



### IntoIterator 特征

由于 `Vec` 动态数组实现了 `IntoIterator` 特征，因此可以通过 `into_iter` 将其转换为迭代器，那如果本身就是一个迭代器，该怎么办？实际上，迭代器自身也实现了 `IntoIterator`，标准库早就帮我们考虑好了：

``` rust
impl <I: Iterator> IntoIterator for I {
    type Item = I:: Item;
    type IntoIter = I;

    #[inline]
    fn into_iter(self) -> I {
        self
    }
}

```

``` rust
fn main() {
    let values = vec! [1, 2, 3];

    for v in values.into_iter().into_iter().into_iter() {
        println!("{}", v)
    }
}
```

#### into_iter, iter, iter_mut

在之前的代码中，我们统一使用了 `into_iter` 的方式将数组转化为迭代器，除此之外，还有 `iter` 和 `iter_mut`，聪明的读者应该大概能猜到这三者的区别：

- `into_iter` 会夺走所有权
- `iter` 是借用
- `iter_mut` 是可变借用

> rust 所有权的核心都绕不开这三种借用

#### Iterator 和 IntoIterator 的区别

这两个其实还蛮容易搞混的，但我们只需要记住，`Iterator` 就是迭代器特征，只有实现了它才能称为迭代器，才能调用 `next`。

而 `IntoIterator` 强调的是某一个类型如果实现了该特征，它可以通过 `into_iter`，`iter` 等方法变成一个迭代器。

### 消费者与适配器

消费者是迭代器上的方法，它会消费掉迭代器中的元素，然后返回其类型的值，这些消费者都有一个共同的特点：在它们的定义中，都依赖 `next` 方法来消费元素，因此这也是为什么迭代器要实现 `Iterator` 特征，而该特征必须要实现 `next` 方法的原因。

#### 消费者适配器

只要迭代器上的某个方法 `A` 在其内部调用了 `next` 方法，那么 `A` 就被称为 **消费性适配器**：因为 `next` 方法会消耗掉迭代器上的元素，所以方法 `A` 的调用也会消耗掉迭代器上的元素。

其中一个例子是 `sum` 方法，它会拿走迭代器的所有权，然后通过不断调用 `next` 方法对里面的元素进行求和：

``` rust
fn main() {
    let v1 = vec! [1, 2, 3];

    let v1_iter = v1.iter();

    let total: i32 = v1_iter.sum();

    assert_eq!(total, 6);

    // v1_iter 是借用了 v1，因此 v1 可以照常使用
    println!("{:?}", v1);

    // 以下代码会报错，因为 `sum` 拿到了迭代器 `v1_iter` 的所有权
    // println!("{:?}", v1_iter);
}
```

#### 迭代器适配器

既然消费者适配器是消费掉迭代器，然后返回一个值。那么迭代器适配器，顾名思义，会返回一个新的迭代器，这是实现链式方法调用的关键：`v.iter().map().filter()...`。

与消费者适配器不同，迭代器适配器是惰性的，意味着你 **需要一个消费者适配器来收尾，最终将迭代器转换成一个具体的值**：

``` rust
let v1: Vec <i32> = vec! [1, 2, 3];

let v2: Vec <_> = v1.iter().map(|x| x + 1).collect();
//这里的 map 方法是一个迭代者适配器，它是惰性的，不产生任何行为，因此我们还需要一个消费者适配器进行收尾：
assert_eq!(v2, vec! [2, 3, 4]);

```

#### collect

`collect` 方法，该方法就是一个消费者适配器，使用它可以将一个迭代器中的元素收集到指定类型中，这里我们为 `v2` 标注了 `Vec<_>` 类型，就是为了告诉 `collect`：请把迭代器中的元素消费掉，然后把值收集成 `Vec<_>` 类型，至于为何使用 `_`，因为编译器会帮我们自动推导。

为何 `collect` 在消费时要指定类型？是因为该方法其实很强大，可以收集成多种不同的集合类型，`Vec<T>` 仅仅是其中之一，因此我们必须显式的告诉编译器我们想要收集成的集合类型。

再来看看如何使用 `collect` 收集成 `HashMap` 集合：

``` rust
use std::collections:: HashMap;
fn main() {
    let names = ["sunface", "sunfei"];
    let ages = [18, 18];
    let folks: HashMap <_, _> = names.into_iter().zip(ages.into_iter()).collect();

    println!("{:?}", folks);
}
```



`zip` 是一个迭代器适配器，它的作用就是将两个迭代器的内容压缩到一起，形成 `Iterator<Item=(ValueFromA, ValueFromB)>` 这样的新的迭代器，在此处就是形如 `[(name1, age1), (name2, age2)]` 的迭代器。

然后再通过 `collect` 将新迭代器中 `(K, V)` 形式的值收集成 `HashMap<K, V>`，同样的，这里必须显式声明类型，然后 `HashMap` 内部的 `KV` 类型可以交给编译器去推导，最终编译器会推导出 `HashMap<&str, i32>`，完全正确！

#### 闭包作为适配器参数

之前的 `map` 方法中，我们使用闭包来作为迭代器适配器的参数，它最大的好处不仅在于可以就地实现迭代器中元素的处理，还在于可以捕获环境值

``` rust
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec <Shoe>, shoe_size: u32) -> Vec <Shoe> {
    shoes.into_iter().filter(|s| s.size == shoe_size).collect()
}

```

filter 是迭代器适配器，用于对迭代器中的每个值进行过滤。 它使用闭包作为参数，该闭包的参数 s 是来自迭代器中的值，然后使用 s 跟外部环境中的 shoe_size 进行比较，若相等，则在迭代器中保留 s 值，若不相等，则从迭代器中剔除 s 值，最终通过 collect 收集为 Vec <Shoe> 类型。

### 实现 Iterator 特征

你也可以创建自己的迭代器 —— 只要为自定义类型实现 `Iterator` 特征即可

``` rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option <Self::Item> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

```

#### 实现 Iterator 特征的其它方法

可以看出，实现自己的迭代器非常简单，但是 `Iterator` 特征中，不仅仅是只有 `next` 一个方法，那为什么我们只需要实现它呢？因为其它方法都具有 [默认实现](https://course.rs/basic/trait/trait.html#默认实现)，所以无需像 `next` 这样手动去实现，而且这些默认实现的方法其实都是基于 `next` 方法实现的。

### enumerate

``` rust
let v = vec! [1u64, 2, 3, 4, 5, 6];
for (i, v) in v.iter().enumerate() {
    println!("第{}个值是{}", i, v)
}

```



首先 `v.iter()` 创建迭代器，其次 调用 `Iterator` 特征上的方法 `enumerate`，该方法产生一个新的迭代器，其中每个元素均是元组 `(索引，值)`。

因为 `enumerate` 是迭代器适配器，因此我们可以对它返回的迭代器调用其它 `Iterator` 特征方法：

``` rust
let v = vec! [1u64, 2, 3, 4, 5, 6];
let val = v.iter()
    .enumerate()
    // 每两个元素剔除一个
    // [1, 3, 5]
    .filter(|&(idx, _)| idx % 2 == 0)
    .map(|(_, val)| val)
    // 累加 1+3+5 = 9
    .fold(0u64, |sum, acm| sum + acm);

println!("{}", val);

```

#### 迭代器的性能

迭代器是 Rust 的 **零成本抽象**（zero-cost abstractions）之一，意味着抽象并不会引入运行时开销，这与 `Bjarne Stroustrup`（C++ 的设计和实现者）在 `Foundations of C++（2012）` 中所定义的 **零开销**（zero-overhead）如出一辙

# 深入类型

## 类型转换

###  as 转换

``` rust
fn main() {
  let a: i32 = 10;
  let b: u16 = 100;

  if a < b {
    println!("Ten is less than one hundred.");
  }
}
```

> [!IMPORTANT]
>
> 每个类型能表达的数据范围不同，如果把范围较大的类型转换成较小的类型，会造成错误，因此我们需要把范围较小的类型转换成较大的类型，来避免这些问题的发生。

### 内存地址转换为指针

``` rust
let mut values: [i32; 2] = [1, 2];
let p1: *mut i32 = values.as_mut_ptr();
let first_address = p1 as usize; // 将 p1 内存地址转换为一个整数
let second_address = first_address + 4; // 4 == std::mem::size_of:: <i32>()，i32 类型占用 4 个字节，因此将内存地址 + 4
let p2 = second_address as *mut i32; // 访问该地址指向的下一个整数 p2
unsafe {
    *p2 += 1;
}
assert_eq!(values [1], 3);

```

### 强制类型转换的边角知识

1. 转换不具有传递性 就算 `e as U1 as U2` 是合法的，也不能说明 `e as U2` 是合法的（`e` 不能直接转换成 `U2`）。

### TryInto 转换

使用 `as` 关键字会有比较大的限制。如果你想要在类型转换上拥有完全的控制而不依赖内置的转换，例如处理转换错误，那么可以使用 `TryInto` ：

``` rust
use std::convert:: TryInto;

fn main() {
   let a: u8 = 10;
   let b: u16 = 1500;

   let b_: u8 = b.try_into().unwrap();

   if a < b_ {
     println!("Ten is less than one hundred.");
   }
}
```

`try_into` 会尝试进行一次转换，并返回一个 `Result`，此时就可以对其进行相应的错误处理。由于我们的例子只是为了快速测试，因此使用了 `unwrap` 方法，该方法在发现错误时，会直接调用 `panic` 导致程序的崩溃退出，在实际项目中，请不要这么使用, 最主要的是 `try_into` 转换会捕获大类型向小类型转换时导致的溢出错误

### 通用类型转换

#### 强制类型转换

在某些情况下，类型是可以进行隐式强制转换的，虽然这些转换弱化了 Rust 的类型系统，但是它们的存在是为了让 Rust 在大多数场景可以工作(说白了，帮助用户省事)，而不是报各种类型上的编译错误。

首先，在匹配特征时，不会做任何强制转换(除了方法)。一个类型 `T` 可以强制转换为 `U`，不代表 `impl T` 可以强制转换为 `impl U`，例如下面的代码就无法通过编译检查：

``` rust
trait Trait {}

fn foo <X: Trait>(t: X) {}

impl <'a> Trait for &'a i32 {}

fn main() {
    let t: &mut i32 = &mut 0;
    foo(t);
}
//&i32 实现了特征 Trait， &mut i32 可以转换为 &i32，但是 &mut i32 依然无法作为 Trait 来使用。
```

#### 点操作符

方法调用的点操作符看起来简单，实际上非常不简单，它在调用时，会发生很多魔法般的类型转换，例如：自动引用、自动解引用，强制类型转换直到类型能匹配等。

假设有一个方法 `foo`，它有一个接收器(接收器就是 `self`、`&self`、`&mut self` 参数)。如果调用 `value.foo()`，编译器在调用 `foo` 之前，需要决定到底使用哪个 `Self` 类型来调用。现在假设 `value` 拥有类型 `T`。

1. 首先，编译器检查它是否可以直接调用 `T::foo(value)`，称之为 **值方法调用**
2. 如果上一步调用无法完成(例如方法类型错误或者特征没有针对 `Self` 进行实现，上文提到过特征不能进行强制转换)，那么编译器会尝试增加自动引用，例如会尝试以下调用： `<&T>::foo(value)` 和 `<&mut T>::foo(value)`，称之为 **引用方法调用**
3. 若上面两个方法依然不工作，编译器会试着解引用 `T` ，然后再进行尝试。这里使用了 `Deref` 特征 —— 若 `T: Deref<Target = U>` (`T` 可以被解引用为 `U`)，那么编译器会使用 `U` 类型进行尝试，称之为 **解引用方法调用**
4. 若 `T` 不能被解引用，且 `T` 是一个定长类型(在编译期类型长度是已知的)，那么编译器也会尝试将 `T` 从定长类型转为不定长类型，例如将 `[i32; 2]` 转为 `[i32]`
5. 若还是不行，那...没有那了，最后编译器大喊一声：汝欺我甚，不干了！

``` rust
let array: Rc <Box<[T; 3]> > = ...;
let first_entry = array [0];

```

1. 首先， `array[0]` 只是 [`Index`](https://doc.rust-lang.org/std/ops/trait.Index.html) 特征的语法糖：编译器会将 `array[0]` 转换为 `array.index(0)` 调用，当然在调用之前，编译器会先检查 `array` 是否实现了 `Index` 特征。
2. 接着，编译器检查 `Rc<Box<[T; 3]>>` 是否有实现 `Index` 特征，结果是否，不仅如此，`&Rc<Box<[T; 3]>>` 与 `&mut Rc<Box<[T; 3]>>` 也没有实现。
3. 上面的都不能工作，编译器开始对 `Rc<Box<[T; 3]>>` 进行解引用，把它转变成 `Box<[T; 3]>`
4. 此时继续对 `Box<[T; 3]>` 进行上面的操作 ：`Box<[T; 3]>`， `&Box<[T; 3]>`，和 `&mut Box<[T; 3]>` 都没有实现 `Index` 特征，所以编译器开始对 `Box<[T; 3]>` 进行解引用，然后我们得到了 `[T; 3]`
5. `[T; 3]` 以及它的各种引用都没有实现 `Index` 索引(是不是很反直觉: D，在直觉中，数组都可以通过索引访问，实际上只有数组切片才可以!)，它也不能再进行解引用，因此编译器只能祭出最后的大杀器：将定长转为不定长，因此 `[T; 3]` 被转换成 `[T]`，也就是数组切片，它实现了 `Index` 特征，因此最终我们可以通过 `index` 方法访问到对应的元素。

## newtype 和 类型别名

### newtype

使用元组结构体的方式将已有的类型包裹起来：`struct Meters(u32);`，那么此处 `Meters` 就是一个 `newtype`。

为何需要 `newtype`？：

- 自定义类型可以让我们给出更有意义和可读性的类型名，例如与其使用 `u32` 作为距离的单位类型，我们可以使用 `Meters`，它的可读性要好得多
- 对于某些场景，只有 `newtype` 可以很好地解决
- 隐藏内部类型的细节

#### 为外部类型实现外部特征

如果在外部类型上实现外部特征必须使用 `newtype` 的方式，否则你就得遵循孤儿规则：要为类型 `A` 实现特征 `T`，那么 `A` 或者 `T` 必须至少有一个在当前的作用范围内。

例如，如果想使用 `println!("{}", v)` 的方式去格式化输出一个动态数组 `Vec`，以期给用户提供更加清晰可读的内容，那么就需要为 `Vec` 实现 `Display` 特征，但是这里有一个问题： `Vec` 类型定义在标准库中，`Display` 亦然，这时就可以祭出大杀器 `newtype` 来解决

``` rust
use std:: fmt;

struct Wrapper(Vec <String>);

impl fmt:: Display for Wrapper {
    fn fmt(&self, f: &mut fmt:: Formatter) -> fmt:: Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec! [String:: from("hello"), String:: from("world")]);
    println!("w = {}", w);
}
```

如上所示，使用元组结构体语法 `struct Wrapper(Vec<String>)` 创建了一个 `newtype` Wrapper，然后为它实现 `Display` 特征，最终实现了对 `Vec` 动态数组的格式化输出。

#### 更好的可读性及类型异化



#### 隐藏内部类型的细节

### 类型别名(Type Alias)

除了使用 `newtype`，我们还可以使用一个更传统的方式来创建新类型：类型别名

``` rust
type Meters = u32
```

**类型别名并不是一个独立的全新的类型，而是某一个类型的别名**，因此编译器依然会把 `Meters` 当 `u32` 来使用：

> [!WARNING]
>
> 此处与 go 不同，go 语言类型别名无法通过编译器识别，如果需要则需要在定义时候，显式告诉编译器通过底层基本类型进行识别

### ! 永不返回类型

`!` 用来说明一个函数永不返回任何值：

``` rust
fn main() {
    let i = 2;
    let v = match i {
       0..= 3 => i,
       _ => println!("不合规定的值:{}", i)
    };
}
```

上面函数，会报出一个编译错误:, 原因很简单: 要赋值给 `v`，就必须保证 `match` 的各个分支返回的值是同一个类型，但是上面一个分支返回数值、另一个分支返回元类型 `()`，自然会出错。

既然 `println` 不行，那再试试 `panic`

你猜的没错：`panic` 的返回值是 `!`，代表它决不会返回任何值，既然没有任何返回值，那自然不会存在分支类型不匹配的情况。

## Sized 和不定长类型 DST

如果从编译器何时能获知类型大小的角度出发，可以分成两类:

+ 定长类型( sized )，这些类型的大小在编译时是已知的
+ 不定长类型( unsized )，与定长类型相反，它的大小只有到了程序运行时才能动态获知，这种类型又被称之为 DST
  首先，我们来深入看看何为 DST。

### 动态大小类型 DST

之前学过的几乎所有类型，都是固定大小的类型，包括集合 `Vec`、`String` 和 `HashMap` 等, **编译器无法在编译期得知该类型值的大小，只有到了程序运行时，才能动态获知**。对于动态类型，我们使用 `DST`(dynamically sized types)或者 `unsized` 类型来称呼它。

上述的这些集合虽然底层数据可动态变化，感觉像是动态大小的类型。但是实际上，**这些底层数据只是保存在堆上，在栈中还存有一个引用类型**，该引用包含了集合的内存地址、元素数目、分配空间信息，通过这些信息，编译器对于该集合的实际大小了若指掌，最最重要的是：**栈上的引用类型是固定大小的**，因此它们依然是固定大小的类型。

**正因为编译器无法在编译期获知类型大小，若你试图在代码中直接使用 DST 类型，将无法通过编译。**

#### 切片

切片也是一个典型的 DST 类型，具体详情参见另一篇文章: [易混淆的切片和切片引用](https://course.rs/difficulties/slice.html)。

####  str

考虑一下这个类型：`str`，感觉有点眼生？是的，它既不是 `String` 动态字符串，也不是 `&str` 字符串切片，而是一个 `str`。它是一个动态类型，同时还是 `String` 和 `&str` 的底层数据类型。 由于 `str` 是动态类型，因此它的大小直到运行期才知道

Rust 需要明确地知道一个特定类型的值占据了多少内存空间，同时该类型的所有值都必须使用相同大小的内存。如果 Rust 允许我们使用这种动态类型，那么这两个 `str` 值就需要占用同样大小的内存，这显然是不现实的: `s1` 占用了 12 字节，`s2` 占用了 15 字节，总不至于为了满足同样的内存大小，用空白字符去填补字符串吧？

所以，我们只有一条路走，那就是给它们一个固定大小的类型：`&str`。那么为何字符串切片 `&str` 就是固定大小呢？因为它的引用存储在栈上，具有固定大小(类似指针)，同时它指向的数据存储在堆中，也是已知的大小，再加上 `&str` 引用中包含有堆上数据内存地址、长度等信息，因此最终可以得出字符串切片是固定大小类型的结论。

与 `&str` 类似，`String` 字符串也是固定大小的类型。

正是因为 `&str` 的引用有了底层堆数据的明确信息，它才是固定大小类型。假设如果它没有这些信息呢？那它也将变成一个动态类型。因此，将动态数据固定化的秘诀就是 **使用引用指向这些动态数据，然后在引用中存储相关的内存位置、长度等信息**。

#### 特征对象

``` rust
fn foobar_1(thing: &dyn MyThing) {}     // OK
fn foobar_2(thing: Box <dyn MyThing>) {} // OK
fn foobar_3(thing: MyThing) {}          // ERROR!

```

如上所示，只能通过引用或 `Box` 的方式来使用特征对象，直接使用将报错！

**总结：只能间接使用的 DST**

Rust 中常见的 `DST` 类型有: `str`、`[T]`、`dyn Trait`，**它们都无法单独被使用，必须要通过引用或者 `Box` 来间接使用** 。

### Sized 特征

Rust 如何保证我们的泛型参数是固定大小的类型呢？

**所有在编译时就能知道其大小的类型，都会自动实现 `Sized` 特征**

**每一个特征都是一个可以通过名称来引用的动态大小类型**。因此如果想把特征作为具体的类型来传递给函数，你必须将其转换成一个特征对象：诸如 `&dyn Trait` 或者 `Box<dyn Trait>` (还有 `Rc<dyn Trait>`)这些引用类型。

现在还有一个问题：假如想在泛型函数中使用动态数据类型怎么办？可以使用 `?Sized` 特征(不得不说这个命名方式很 Rusty，竟然有点幽默)：

``` rust
fn generic <T: ?Sized>(t: &T) {
    // --snip--
}

```

`?Sized` 特征用于表明类型 `T` 既有可能是固定大小的类型，也可能是动态大小的类型。还有一点要注意的是，函数参数类型从 `T` 变成了 `&T`，因为 `T` 可能是动态大小的，因此需要用一个固定大小的指针(引用)来包裹它。

### Box <str>

如何把一个动态大小类型转换成固定大小的类型： **使用引用指向这些动态数据，然后在引用中存储相关的内存位置、长度等信息**

不知道 `str` 的大小，因此无法使用这种语法进行 `Box` 进装，但是你可以这么做:

``` rust
let s1: Box <str> = "Hello there!".into();
```

主动转换成 `str` 的方式不可行，但是可以让编译器来帮我们完成，只要告诉它我们需要的类型即可。

# 智能指针

## Box 堆对象分配

>
>
>`Box<T>` 允许你将一个值分配到堆上，然后在栈上保留一个智能指针指向堆上的数据。

### 堆栈的性能

很多人可能会觉得栈的性能肯定比堆高，其实未必。 由于我们在后面的性能专题会专门讲解堆栈的性能问题，因此这里就大概给出结论：

- 小型数据，在栈上的分配性能和读取性能都要比堆上高
- 中型数据，栈上分配性能高，但是读取性能和堆上并无区别，因为无法利用寄存器或 CPU 高速缓存，最终还是要经过一次内存寻址
- 大型数据，只建议在堆上分配和使用

栈的分配速度肯定比堆上快，但是读取速度往往取决于你的数据能不能放入寄存器或 CPU 高速缓存。 因此不要仅仅因为堆上性能不如栈这个印象，就总是优先选择栈，导致代码更复杂的实现。

### Box 的使用场景

由于 `Box` 是简单的封装，除了将值存储在堆上外，并没有其它性能上的损耗。而性能和功能往往是鱼和熊掌，因此 `Box` 相比其它智能指针，功能较为单一，可以在以下场景中使用它：

- 特意的将数据分配在堆上
- 数据较大时，又不想在转移所有权时进行数据拷贝
- 类型的大小在编译期无法确定，但是我们又需要固定大小的类型时
- 特征对象，用于说明对象实现了一个特征，而不是某个特定的类型

####  使用 Box <T> 将数据存储在堆上

``` rust
fn main() {
    let a = Box:: new(3);
    println!("a = {}", a); // a = 3

    // 下面一行代码将报错
    // let b = a + 1; // cannot add `{integer}` to `Box<{integer}>`
}
```



- `println!` 可以正常打印出 `a` 的值，是因为它隐式地调用了 `Deref` 对智能指针 `a` 进行了解引用
- 最后一行代码 `let b = a + 1` 报错，是因为在表达式中，我们无法自动隐式地执行 `Deref` 解引用操作，你需要使用 `*` 操作符 `let b = *a + 1`，来显式的进行解引用
- `a` 持有的智能指针将在作用域结束（`main` 函数结束）时，被释放掉，这是因为 `Box<T>` 实现了 `Drop` 特征

#### 避免栈上数据的拷贝

当栈上数据转移所有权时，实际上是把数据拷贝了一份，最终新旧变量各自拥有不同的数据，因此所有权并未转移。

而堆上则不然，底层数据并不会被拷贝，转移所有权仅仅是复制一份栈中的指针，再将新的指针赋予新的变量，然后让拥有旧指针的变量失效，最终完成了所有权的转移：

``` rust
fn main() {
    // 在栈上创建一个长度为 1000 的数组
    let arr = [0; 1000];
    // 将 arr 所有权转移 arr1，由于 `arr` 分配在栈上，因此这里实际上是直接重新深拷贝了一份数据
    let arr1 = arr;

    // arr 和 arr1 都拥有各自的栈上数组，因此不会报错
    println!("{:?}", arr.len());
    println!("{:?}", arr1.len());

    // 在堆上创建一个长度为 1000 的数组，然后使用一个智能指针指向它
    let arr = Box:: new([0; 1000]);
    // 将堆上数组的所有权转移给 arr1，由于数据在堆上，因此仅仅拷贝了智能指针的结构体，底层数据并没有被拷贝
    // 所有权顺利转移给 arr1，arr 不再拥有所有权
    let arr1 = arr;
    println!("{:?}", arr1.len());
    // 由于 arr 不再拥有底层数组的所有权，因此下面代码将报错
    // println!("{:?}", arr.len());
}
```



#### 将动态大小类型变为 Sized 固定大小类型

Rust 需要在编译时知道类型占用多少空间，如果一种类型在编译时无法知道具体的大小，那么被称为动态大小类型 DST。

其中一种无法在编译时知道大小的类型是 **递归类型**：在类型定义中又使用到了自身，或者说该类型的值的一部分可以是相同类型的其它值，这种值的嵌套理论上可以无限进行下去，所以 Rust 不知道递归类型需要多少空间：

``` rust
enum List {
    Cons(i32, Box <List>),
    Nil,
}

```

只需要将 `List` 存储到堆上，然后使用一个智能指针指向它，即可完成从 DST 到 Sized 类型(固定大小类型)的华丽转变。

#### 特征对象

在 Rust 中，想实现不同类型组成的数组只有两个办法：枚举和特征对象

``` rust
trait Draw {
    fn draw(&self);
}

struct Button {
    id: u32,
}
impl Draw for Button {
    fn draw(&self) {
        println!("这是屏幕上第{}号按钮", self.id)
    }
}

struct Select {
    id: u32,
}

impl Draw for Select {
    fn draw(&self) {
        println!("这个选择框贼难用{}", self.id)
    }
}

fn main() {
    let elems: Vec <Box<dyn Draw> > = vec! [Box:: new(Button { id: 1 }), Box:: new(Select { id: 2 })];

    for e in elems {
        e.draw()
    }
}
```

## Deref 解引用

何为智能指针？能不让你写出 `****s` 形式的解引用，我认为就是智能: )，智能指针的名称来源，主要就在于它实现了 `Deref` 和 `Drop` 特征，这两个特征可以智能地帮助我们节省使用上的负担：

- `Deref` 可以让智能指针像引用那样工作，这样你就可以写出同时支持智能指针和引用的代码，例如 `*T`
- `Drop` 允许你指定智能指针超出作用域后自动执行的代码，例如做一些数据清除等收尾工作

### 通过 * 获取引用背后的值

常规引用是一个指针类型，包含了目标数据存储的内存地址。对常规引用使用 `*` 操作符

``` rust
fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

### 智能指针解引用

实现 `Deref` 后的智能指针结构体，就可以像普通引用一样，通过 `*` 进行解引用，例如 `Box<T>` 智能指针：

``` rust
 fn main() {
    let x = Box:: new(1);
    let sum = *x + 1;
}
```

智能指针 `x` 被 `*` 解引用为 `i32` 类型的值 `1`，然后再进行求和。

#### 定义自己的智能指针

为智能指针实现 Deref 特征

``` rust

struct MyBox <T>(T);

impl <T> MyBox <T> {
    fn new(x: T) -> MyBox <T> {
        MyBox(x)
    }
}

use std::ops:: Deref;

impl <T> Deref for MyBox <T> {
    type Target = T;

    fn deref(&self) -> &Self:: Target {
        &self.0
    }
}

```



很简单，当解引用 `MyBox` 智能指针时，返回元组结构体中的元素 `&self.0`，有几点要注意的：

- 在 `Deref` 特征中声明了关联类型 `Target`，在之前章节中介绍过，关联类型主要是为了提升代码可读性
- `deref` 返回的是一个常规引用，可以被 `*` 进行解引用

### * 背后的原理

当我们对智能指针 `Box` 进行解引用时，实际上 Rust 为我们调用了以下方法：

``` rust
*(y.deref())

```

首先调用 `deref` 方法返回值的常规引用，然后通过 `*` 对常规引用进行解引用，最终获取到目标值。

至于 Rust 为何要使用这个有点啰嗦的方式实现，原因在于所有权系统的存在。如果 `deref` 方法直接返回一个值，而不是引用，那么该值的所有权将被转移给调用者，而我们不希望调用者仅仅只是 `*T` 一下，就拿走了智能指针中包含的值。

需要注意的是，`*` 不会无限递归替换，从 `*y` 到 `*(y.deref())` 只会发生一次，而不会继续进行替换然后产生形如 `*((y.deref()).deref())` 的怪物。

### 函数和方法中的隐式 Deref 转换

对于函数和方法的传参，Rust 提供了一个极其有用的隐式转换：Deref 转换。若一个类型实现了 Deref 特征，那它的引用在传给函数或方法时，会根据参数签名来决定是否进行隐式的 Deref 转换，例如

``` rust
fn main() {
    let s = String:: from("hello world");
    display(&s)
}

fn display(s: &str) {
    println!("{}", s);
}
```

以上代码有几点值得注意：

- `String` 实现了 `Deref` 特征，可以在需要时自动被转换为 `&str` 类型
- `&s` 是一个 `&String` 类型，当它被传给 `display` 函数时，自动通过 `Deref` 转换成了 `&str`
- 必须使用 `&s` 的方式来触发 `Deref`(<span style="color:#FF0000;">仅引用类型的实参才会触发自动解引用</span>)

#### 连续的隐式 Deref 转换

如果你以为 `Deref` 仅仅这点作用，那就大错特错了。`Deref` 可以支持连续的隐式转换，直到找到适合的形式为止：

``` rust
fn main() {
    let s = MyBox:: new(String:: from("hello world"));
    display(&s)
}

fn display(s: &str) {
    println!("{}", s);
}
```

这里我们使用了之前自定义的智能指针 `MyBox`，并将其通过连续的隐式转换变成 `&str` 类型：首先 `MyBox` 被 `Deref` 成 `String` 类型，结果并不能满足 `display` 函数参数的要求，编译器发现 `String` 还可以继续 `Deref` 成 `&str`，最终成功的匹配了函数参数。

### Deref 规则总结

#### 引用归一化

rust 编译器实际上只能对 `&v` 形式的引用进行解引用操作，那么问题来了，如果是一个智能指针或者 `&&&&v` 类型的呢？ 该如何对这两个进行解引用？

答案是：Rust 会在解引用时自动把智能指针和 `&&&&v` 做引用归一化操作，转换成 `&v` 形式，最终再对 `&v` 进行解引用：

- 把智能指针（比如在库中定义的，Box、Rc、Arc、Cow 等）从结构体脱壳为内部的引用类型，也就是转成结构体内部的 `&v`
- 把多重 `&`，例如 `&&&&&&&v`，归一成 `&v`

### 三种 Deref 转换

在之前，我们讲的都是不可变的 `Deref` 转换，实际上 Rust 还支持将一个可变的引用转换成另一个可变的引用以及将一个可变引用转换成不可变的引用，规则如下：

- 当 `T: Deref<Target=U>`，可以将 `&T` 转换成 `&U`，也就是我们之前看到的例子
- 当 `T: DerefMut<Target=U>`，可以将 `&mut T` 转换成 `&mut U`
- 当 `T: Deref<Target=U>`，可以将 `&mut T` 转换成 `&U`

``` rust
struct MyBox <T> {
    v: T,
}

impl <T> MyBox <T> {
    fn new(x: T) -> MyBox <T> {
        MyBox { v: x }
    }
}

use std::ops:: Deref;

impl <T> Deref for MyBox <T> {
    type Target = T;

    fn deref(&self) -> &Self:: Target {
        &self.v
    }
}

use std::ops:: DerefMut;

impl <T> DerefMut for MyBox <T> {
    fn deref_mut(&mut self) -> &mut Self:: Target {
        &mut self.v
    }
}

fn main() {
    let mut s = MyBox:: new(String:: from("hello, "));
    display(&mut s)
}

fn display(s: &mut String) {
    s.push_str("world");
    println!("{}", s);
}
```

