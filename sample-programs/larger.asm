#larger.asm-- prints the larger of two numbers specified
#	at runtime by the user
#Registers used:
#	$t0	- used to hold the first number.
#	$t1	- used to hold the second number.
#	$t2 	- used to store the larger of $t1 and $t2.

	.text
main:
	## Get first number from user, put into $t0.
	li 	$v0, 5		#load syscall read_ind into $v0.
	syscall			# make the syscall.
	move	$t0, $v0	# move the number read into $t0.

	## Get second number from user, put into $t2.
	li	$v0, 5		# load syscall read_int into $v0.
	syscall			# make the syscall.
	move 	$t1, $v0	# move the number read into $t1.

	##put the larger of $t0 and $t1 into $t2.
	bgt	$t0, $t1, t0_larger
	move 	$t2, $t1
	b	endif

t0_larger:	
	move	$t2, $t0
endif:
	## Print out $t2.
	move	$a0, $t2	# move the number to print into $a0.
	li 	$v0, 1		# load syscall print_int into $v0.
	syscall

	##exit the program
	li $v0, 10
	syscall
#end of larger.asm.
