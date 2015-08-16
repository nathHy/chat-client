<?php

// http://stackoverflow.com/questions/2320608/php-stderr-after-exec
$command = './test.sh';
$command = 'ehco "hello"; echo "hello world" > test.txt'; // comment out to use script file.


echo "Testing new function\n";
$result = my_shell_exec($command);

echo 'stdout is : ' . $result['stdout'] . "\n";
echo 'stderr is : ' . $result['stderr'] . "\n";
echo 'return is : ' . $result['return_val'] . "\n";

echo '---------------------------------------------------';
echo "\ntesting exec now\n";
$test = exec($command,$output,$returnval);


echo 'Command is : ' . $command . "\n";
echo 'Output is array of size : ' . sizeof($output) . "\n";
echo 'Return value is : ' . $returnval . "\n";


/* 
*	Returns array with keys
*		return_val 	- The return value of the command executed
*		stdout 		- The stdout of the command ran
*		stderr 		- The stderr of the command ran
*/

function my_shell_exec($cmd,$stdout=null,$stderr=null) {
	$proc = proc_open($cmd,[
		1=>['pipe','w'],
		2=>['pipe','w'],
	],$pipes);
	$stdout = stream_get_contents($pipes[1]);
	fclose($pipes[1]);
	$stderr = stream_get_contents($pipes[2]);
	fclose($pipes[2]);
	$return_val=proc_close($proc);
	return array(
		'return_val'=>$return_val,
		'stdout'=>$stdout,
		'stderr'=>$stderr
	);
}
