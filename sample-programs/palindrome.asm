## Caitlin E. Scarberry -- 07/01/15
## palindrome.asm -- reads a line of text and tests if it is a palindrome.
## Register usage:
##	$t1	- A.
##	$t2	- B.
##	$t3	- the character at address A.
##	$t4	- the character at address B.
##	$v0	- the syscall parameter / return values.
##	$a0	- syscall parameters.
##	$a1	- syscall parameters.
		.text
main:
	la	$a0, prompt
	li $v0, 4
	syscall

	la 	$a0, string_space
	li	$a1, 1024
	li 	$t8, 1
	li	$v0, 8	#8 is read_string
	syscall

	la	$t1, string_space
	la	$t2, string_space

length_loop:
	lb 	$t3, ($t2)
	beqz	$t3, end_length_loop	# if $t3 == 0, end the loop
	add	$t2, $t2, $t8		#otherwise increment
	b	length_loop

end_length_loop:
	sub	$t2, $t2, 2	#subtract 2 to move B back past the \0 and the newline
	
test_loop:
	bge	$t1, $t2, is_palin #if A >= B, it's a palindrome

	lb	$t3, ($t1)
	lb	$t4, ($t2)

	bne 	$t3, $t4, not_palin

	add	$t1, $t1, $t8
	sub	$t2, $t2, $t8
	b	test_loop

is_palin:
	la	$a0, is_palin_msg
	li	$v0, 4
	syscall
	b	exit

not_palin:
	la	$a0, not_palin_msg
	li	$v0, 4
	syscall
	b	exit

exit:
	li	$v0, 10
	syscall

	.data
string_space:	.space 1024
is_palin_msg:	.asciiz "The string is a palindrome.\n"
not_palin_msg:	.asciiz "The string is not a palindrome.\n"
prompt:	.asciiz "Enter a string to see if it is a palindrome:\n"
