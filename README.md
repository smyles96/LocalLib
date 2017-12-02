# LocalLib

## What?
LocalLib is a small [OpenLibrary](https://openlibrary.org/) API portal site that is run off Python's SimpleHTTPServer. It was a weekend project to allow easy access to OpenLibrary's collection by running the server off a Raspberry Pi B+ on the local network.
___

## Requirements
* Python 2 or 3

___

## Installation (using Git)
1) Clone this repository:

`git clone https://github.com/skmyles/LocalLib.git locallib`

2) Now change into the directory that was downloaded:

`cd locallib`

3) Now type this command to start the server:

`python libserver.py 8000`

4) Open up a web browser and type one of the following depending on where you're running the server from:

| Server Location | Command                    |
| :------------   |:---------------------------|
| Local Machine   | `localhost:8000`           |
| Remote Machine  | `<REMOTE-MACHINE-IP>:8000` |


If all went as planned you should see something like this appear:

![alt text](http://i68.tinypic.com/2s84dp2.png)

## FAQ
* Can I change the port the server runs off of?

Yes you can. When running the command to start the server a port number can be specified like so:

`python libserver.py <Port Number>`

If left unspecified, the server runs on port 80 (the standard HTTP port)

___

* You said you were running this on a Raspberry Pi?

Correct. Because the code that queries the API is written in AngularJS, your browser is really the component that's doing the heavy lifting, the Pi only needs to worry about serving the site files to your browser.

Another tip I suggest when running the server on the Pi (or any embedded system running linux) is to run the server as a background process using the no-hup command like so:

`python libserver.py &`

When you're ready to stop the server, you need to find the program's PID by typing:

`jobs -l`

Take note of the number (PID) near the start of the line for the program and type:

`sudo kill <PROGRAM-PID>`

___

* Why am I getting errors about improper permissions?

This is most likely caused by running the server without proper admin rights. On Widows ensure that you have Administrator Privileges when running the script. If you're on Linux, then appending `sudo` to the start of the command should solve the issue.

___

* Why does the page crash when I try to use the search bar a second time?

Not to pass the buck, but I think the OpenLibrary API is the cause of this error. In the process of debugging the code due to this error, I began inspecting the server's responses to the requests being made and found that it always sent back a 500 status code on the second consecutive request along with an "error making request" webpage (the response didn't list any specific error). I'll probably develop some hackish way around this until the API is smoothed out, but in the meantime, just reload the page.
