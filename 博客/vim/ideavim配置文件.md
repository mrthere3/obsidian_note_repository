---
categories: 
cover:
title: ideavim配置文件
created: 2023-10-16 09:54
updated: 2023-10-16 09:54
---
# ideavim配置文件
```shell
"" Source your .vimrc
"source ~/.vimrc

let mapleader=" "
set timeoutlen=500
set commentary
set multiple-cursors
set NERDTree
:set keep-english-in-normal-and-restore-in-insert
set surround
set multiple-cursors
set commentary
set easymotion
set argtextobj
set incsearch
nmap <C-n> <Plug> NextWholeOccurrence
xmap <C-n> <Plug> NextWholeOccurrence
nmap <C-x> <Plug> SkipOccurrence
хтар <C-x> <Plug> SkipOccurrence
map <C-q> <Plug> RemoveOccurrence
xmap <C-q> <Plug> RemoveOccurrence
nmap <S-C-n> <Plug>AllWholeOccurrences
xmap <S-C-n> <Plug> AllWholeOccurrences
nnoremap <leader>ns :action SurroundWith<CR>
vnoremap <leader>ns :action SurroundWith<CR>
noremap gr :action FindUsages<CR>
nnoremap gd mm’ m:action GotoDeclaration<CR>
noremap gi mm’ m:action Gotolmplementation<CR>
noremap K :action QuickJavaDoc<CR
nnoremap <leader>g :action Generate<CR>
set ts=4
set clipboard+=unnamed
set expandtab
set shiftwidth=4
set softtabstop=4 你好
"设置默认进行大小写不敏感查找
vnoremap Tab> ><CR>
noremap <Tab> ><CR>
nnoremap <leader>s <C-:> <CR>
set ignorecase
set so=5
nnoremap gO :set relativenumber!<CR>
noremap <leader>sc nohlsearch<Cr>
set hlsearch "搜素高亮显示，缩写：sethls
set highlightedyank
set ignorecase
set incsearch
"yiw 的时候 短暂的高亮复制 的对象，搜索时忽略大小写
"搜索时立即高亮结果
"如果有一个大写字母，则切换到大小写敏感查找
set smartcase
set showmatch
"set relativenumber
set showmode
"设置相对行号，缩写：set mu
"在底部显示当前模式
set showed
"在状态栏中显示命令
"Don‘t use Ex mode, use Q for formatting.
map Q gg
noremap <leader>e :NERDTree<CR>
nnoremap <leader>o :NERDTreeClose<CR>
nnoremap «Leader>/ :action CommentByLineComment<CR>
vnoremap <Leader>/ :action CommentByLineComment<CR>
nnoremap <leader>c :action CloseContent<CR>
nnoremap <leader> bl mm ‘m:action CloseAlIToTheLeft<CR>
noremap <leader>br mm’m:action CloseAlIToTheRight<CR>
nnoremap <C-s> mm‘m:action SaveAlK<CR>
nnoremap ]b :action SelectNextTab<CR>
noremap [b :action SelectLastTab<CR>
"当光标一段时间保持不动了，就禁用高亮
automd cursorhold * set nohlsearch
"当输入查找命令时，再启用高亮
noremap n :set hisearch<cr>n
noremap N :set hisearch<er> N
noremap / :set hisearch<cr>/
noremap? :set hisearch <cr>?
noremap * *:set hlsearch<cr>
noremap <leader>n :nohlsearch <cr>

```