#!/usr/bin/env python

from sys import argv

# Python 2 imports and class declarations
try:
	from SimpleHTTPServer import SimpleHTTPRequestHandler
	from SocketServer import TCPServer
	
	class LocalLibRequestHandler(SimpleHTTPRequestHandler):
		
		# Override send_response method to prevent logging
		# to stderr. Also allows us to send custom headers
		# and prevent some headers from being sent (ex. Server)
		# We have to define the class in each branch of the exception
		# path because the method is written differently in Python
		# 2 than in Python 3
		def send_response(self, code, message=None):

			if message is None:
				if code in self.responses:
					message = self.responses[code][0]
				else:
					message = ''
					
			if self.request_version != 'HTTP/0.9':
				self.wfile.write("%s %d %s\r\n" % (self.protocol_version, code, message))

			self.send_header('Date', self.date_time_string())
			self.send_header('x-xss-protection', '1')     # Force XSS filter to be on in most browsers
			self.send_header('x-content-type', 'nosniff') # Prevent Chrome and IE from sniffing away response from content type
			
		# Remove console logging methods
		def log_request(self, code='-', size='-'):	return
		def log_error(self, format, *args):	return
		def log_message(self, format, *args):	return

# Python 3 imports and class declarations
except ImportError:
	from http.server import SimpleHTTPRequestHandler
	from socketserver import TCPServer
	
	class LocalLibRequestHandler(SimpleHTTPRequestHandler):
		
		# Override send_response method to prevent logging
		# to stderr. Also allows us to send custom headers
		# and prevent some headers from being sent (ex. Server)
		def send_response(self, code, message=None):
			self.send_response_only(code, message)
			self.send_header('Date', self.date_time_string())
			self.send_header('x-xss-protection', '1')     # Force XSS filter to be on in most browsers
			self.send_header('x-content-type', 'nosniff') # Prevent Chrome and IE from sniffing away response from content type
			
		# Remove console logging methods
		def log_request(self, code='-', size='-'):	return
		def log_error(self, format, *args):	return
		def log_message(self, format, *args):	return

# Gather the port from the command line, or set it to default port 80 (http)
PORT = 80 if len(argv) < 2 else int(argv[1])

# Start the server
httpd = TCPServer(("", PORT), LocalLibRequestHandler)
httpd.serve_forever()

