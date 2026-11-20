/* ============================================================================
   QUESTIONAIRE — questions/computing/computer-science.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "computer-science",
    area: "computing",
    title: "Computer science",
    subjects: ["ap-computer-science-a", "ap-computer-science-principles", "ap-cybersecurity", "computer-science"],
    facts: [
      ["What does CPU stand for?", "Central Processing Unit", ["Computer Personal Unit", "Central Program Utility", "Control Processing User"], "The CPU executes instructions and coordinates components."],
      ["Which data structure uses first-in, first-out order?", "Queue", ["Stack", "Tree", "Graph"], "A queue removes the oldest item first."],
      ["Which data structure uses last-in, first-out order?", "Stack", ["Queue", "Array", "Heap"], "A stack removes the most recent item first."],
      ["What is the time complexity of binary search on a sorted array?", "O(log n)", ["O(n)", "O(n²)", "O(1)"], "Each comparison halves the search space."],
      ["Which principle gives users only the access they need?", "Least privilege", ["Open access", "Fail open", "Security through obscurity"], "Least privilege limits damage from a compromised account."],
      ["What does HTTPS add to HTTP?", "Encryption and authentication", ["Faster downloads", "Larger files", "A database"], "TLS protects data in transit and authenticates the server."],
      ["What is a variable in programming?", "A named storage location", ["A fixed constant", "A type of loop", "A network protocol"], "Variables hold values that can change."],
      ["Which sorting algorithm repeatedly selects the smallest remaining item?", "Selection sort", ["Merge sort", "Quick sort", "Bubble sort"], "Selection sort finds the minimum and places it next."],
      ["What is a function?", "A reusable block of code that performs a task", ["A hardware component", "A database table", "A network cable"], "Functions package behaviour behind a name."],
      ["What does SQL primarily manage?", "Relational data", ["Images", "Network routing", "Operating systems"], "SQL queries and manipulates relational databases."],
      ["What is a hash function used for?", "Mapping data to a fixed-size value", ["Encrypting every message", "Rendering graphics", "Compiling code"], "Hashes support lookup, integrity checks and signatures."],
      ["Which protocol resolves domain names to IP addresses?", "DNS", ["FTP", "SMTP", "SSH"], "DNS translates names such as example.com into addresses."],
      ["What is the purpose of version control?", "Track changes to files over time", ["Speed up the CPU", "Encrypt the disk", "Design user interfaces"], "Version control records history and supports collaboration."],
      ["What is an API?", "A defined interface for software to interact", ["A physical port", "A database engine", "A programming language"], "APIs specify requests, responses and contracts."],
      ["What does a firewall do?", "Filter network traffic", ["Compile code", "Store files", "Render fonts"], "Firewalls allow or block traffic by rule."],
      ["What is phishing?", "A deceptive attempt to steal credentials or install malware", ["A network cable", "A type of encryption", "A backup strategy"], "Phishing targets people through convincing messages."],
      ["What is the cloud?", "Remote computing and storage accessed over a network", ["A weather system", "A local hard drive", "A programming language"], "Cloud services run on provider infrastructure."],
      ["What is a bug?", "An error in a program", ["A feature", "A type of hardware", "A secure protocol"], "Bugs cause incorrect or unexpected behaviour."],
      ["What is recursion?", "A function that calls itself on a smaller problem", ["A loop that never ends", "A type of variable", "A network request"], "Recursion needs a base case to stop."],
      ["What is Big-O notation used for?", "Describing how runtime grows with input size", ["Measuring CPU temperature", "Counting lines of code", "Encoding characters"], "It expresses an upper bound on growth."],
      ["What is an IP address?", "A numeric label identifying a device on a network", ["A domain name", "A password", "A file extension"], "IPv4 and IPv6 addresses route packets."]
    ]
  });
})();
