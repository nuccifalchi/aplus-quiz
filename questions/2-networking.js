QUIZ.register({
  "domain": "2.0 Networking",
  "weight": 23,
  "questions": [
    {
      "id": "net-001",
      "objective": "2.1",
      "question": "Which port does HTTPS use by default?",
      "choices": ["80", "443", "8080", "22"],
      "answer": 1,
      "explanation": "HTTPS uses TCP 443. Plain, unencrypted HTTP uses port 80."
    },
    {
      "id": "net-002",
      "objective": "2.1",
      "question": "A technician needs to allow Remote Desktop through a firewall. Which port should be opened?",
      "choices": ["22", "23", "445", "3389"],
      "answer": 3,
      "explanation": "RDP uses port 3389. Port 22 is SSH, 23 is Telnet, and 445 is SMB."
    },
    {
      "id": "net-003",
      "objective": "2.1",
      "question": "Which ports does DHCP use?",
      "choices": ["20/21", "53", "67/68", "137-139"],
      "answer": 2,
      "explanation": "DHCP uses UDP 67 (server) and 68 (client). 20/21 is FTP, 53 is DNS, and 137-139 is NetBIOS."
    },
    {
      "id": "net-004",
      "objective": "2.1",
      "question": "Which statement best describes UDP compared to TCP?",
      "choices": [
        "UDP is connection-oriented and guarantees delivery",
        "UDP is connectionless, with less overhead and no delivery guarantee",
        "UDP is only used for email",
        "UDP encrypts all traffic by default"
      ],
      "answer": 1,
      "explanation": "TCP sets up a session, acknowledges data, and retransmits anything lost. UDP just sends, which makes it faster but unreliable. That suits DNS lookups, DHCP, and streaming."
    },
    {
      "id": "net-005",
      "objective": "2.1",
      "question": "Which TWO protocols does an email client use to retrieve mail from a server?",
      "choices": ["SMTP", "POP3", "IMAP", "LDAP", "SNMP"],
      "answer": [1, 2],
      "explanation": "POP3 (110) and IMAP (143) retrieve mail. SMTP (25) sends mail between servers and from clients, and LDAP (389) is for directory lookups."
    },
    {
      "id": "net-006",
      "objective": "2.1",
      "question": "Which port is used by SMB/CIFS for Windows file sharing?",
      "choices": ["389", "443", "445", "110"],
      "answer": 2,
      "explanation": "SMB/CIFS runs on TCP 445. Older NetBIOS-based sharing also used 137-139."
    },
    {
      "id": "net-007",
      "objective": "2.2",
      "question": "Which Wi-Fi frequency band has the longest range but only three non-overlapping channels (1, 6, and 11) in North America?",
      "choices": ["2.4GHz", "5GHz", "6GHz", "60GHz"],
      "answer": 0,
      "explanation": "2.4GHz travels farther and through walls better, but it is crowded and has only three non-overlapping 20MHz channels."
    },
    {
      "id": "net-008",
      "objective": "2.2",
      "question": "Which wireless standard added support for the 6GHz band?",
      "choices": ["802.11n (Wi-Fi 4)", "802.11ac (Wi-Fi 5)", "802.11ax (Wi-Fi 6E)", "802.11g"],
      "answer": 2,
      "explanation": "Wi-Fi 6E extends 802.11ax into the 6GHz band. Wi-Fi 5 (802.11ac) is 5GHz only."
    },
    {
      "id": "net-009",
      "objective": "2.3",
      "question": "Which server role keeps clocks synchronized across network devices?",
      "choices": ["Syslog", "NTP", "DNS", "AAA"],
      "answer": 1,
      "explanation": "Network Time Protocol (NTP) synchronizes time. Accurate time matters for logs and for authentication protocols like Kerberos."
    },
    {
      "id": "net-010",
      "objective": "2.3",
      "question": "Which network appliance distributes incoming requests across several web servers?",
      "choices": ["Proxy server", "Load balancer", "Spam gateway", "UTM"],
      "answer": 1,
      "explanation": "A load balancer spreads traffic across servers for performance and availability. A proxy makes requests on behalf of clients."
    },
    {
      "id": "net-011",
      "objective": "2.4",
      "question": "Which DNS record type maps a hostname to an IPv6 address?",
      "choices": ["A", "AAAA", "CNAME", "MX"],
      "answer": 1,
      "explanation": "AAAA is for IPv6 and A is for IPv4. CNAME is an alias, and MX points to mail servers."
    },
    {
      "id": "net-012",
      "objective": "2.4",
      "question": "A network printer must always receive the same IP address from DHCP. What should be configured?",
      "choices": ["A DHCP exclusion", "A DHCP reservation", "A shorter lease time", "A new scope"],
      "answer": 1,
      "explanation": "A reservation ties an IP address to the device's MAC address. An exclusion keeps an address out of the pool so it can be assigned statically."
    },
    {
      "id": "net-013",
      "objective": "2.4",
      "question": "Which DNS TXT record lists the mail servers authorized to send email for a domain?",
      "choices": ["DKIM", "SPF", "DMARC", "MX"],
      "answer": 1,
      "explanation": "SPF lists the authorized sending servers. DKIM adds a cryptographic signature, and DMARC sets the policy for messages that fail those checks."
    },
    {
      "id": "net-014",
      "objective": "2.4",
      "question": "What allows a single physical switch to be split into separate logical networks?",
      "choices": ["VPN", "VLAN", "NAT", "APIPA"],
      "answer": 1,
      "explanation": "Virtual LANs (VLANs) segment one switch into isolated broadcast domains. A VPN is an encrypted tunnel over another network."
    },
    {
      "id": "net-015",
      "objective": "2.5",
      "question": "Which device forwards traffic within a LAN based on MAC addresses?",
      "choices": ["Router", "Switch", "Cable modem", "ONT"],
      "answer": 1,
      "explanation": "Switches forward frames using MAC addresses (Layer 2). Routers move packets between networks using IP addresses."
    },
    {
      "id": "net-016",
      "objective": "2.5",
      "question": "A new wireless access point needs power, but the existing switch does not support PoE. What is the simplest fix?",
      "choices": ["A PoE injector", "A patch panel", "A managed switch firmware update", "A cable modem"],
      "answer": 0,
      "explanation": "A PoE injector adds power to the Ethernet cable between a non-PoE switch and the device."
    },
    {
      "id": "net-017",
      "objective": "2.6",
      "question": "A PC shows the IP address 169.254.10.22. What does this most likely mean?",
      "choices": [
        "It has a static public IP",
        "It could not reach a DHCP server and assigned itself an APIPA address",
        "It is using IPv6",
        "It is connected through a VPN"
      ],
      "answer": 1,
      "explanation": "169.254.x.x is APIPA. Windows assigns it when DHCP doesn't respond, and it allows only local-link communication."
    },
    {
      "id": "net-018",
      "objective": "2.6",
      "question": "Which of these is a private IPv4 address?",
      "choices": ["172.32.4.1", "192.169.1.10", "172.16.5.10", "11.0.0.5"],
      "answer": 2,
      "explanation": "The private ranges are 10.0.0.0/8, 172.16.0.0-172.31.255.255, and 192.168.0.0/16. 172.32.x.x and 192.169.x.x fall outside them."
    },
    {
      "id": "net-019",
      "objective": "2.7",
      "question": "A smartwatch, earbuds, and phone connected by Bluetooth form which type of network?",
      "choices": ["LAN", "PAN", "MAN", "SAN"],
      "answer": 1,
      "explanation": "A personal area network (PAN) covers the few meters around one person."
    },
    {
      "id": "net-020",
      "objective": "2.7",
      "question": "A rural office has no cable or fiber service, and satellite latency is too high. A provider offers service from a nearby tower using fixed antennas. What is this?",
      "choices": ["DSL", "WISP", "SAN", "PAN"],
      "answer": 1,
      "explanation": "A wireless internet service provider (WISP) delivers fixed wireless internet from towers, which is common in rural areas."
    },
    {
      "id": "net-021",
      "objective": "2.8",
      "question": "A technician needs to find which patch panel port an unlabeled wall jack connects to. Which tool should they use?",
      "choices": ["Loopback plug", "Toner probe", "Crimper", "Wi-Fi analyzer"],
      "answer": 1,
      "explanation": "A toner puts a signal on the cable, and the probe detects it at the other end."
    },
    {
      "id": "net-022",
      "objective": "2.8",
      "question": "Which tool terminates wires into a keystone jack or 110 block?",
      "choices": ["Punchdown tool", "Crimper", "Cable stripper", "Network tap"],
      "answer": 0,
      "explanation": "A punchdown tool seats and trims wires in punchdown blocks and keystone jacks. A crimper attaches RJ45 plugs."
    }
  ]
});
