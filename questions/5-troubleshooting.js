QUIZ.register({
  "domain": "5.0 Hardware and Network Troubleshooting",
  "weight": 28,
  "questions": [
    {
      "id": "ts-001",
      "objective": "5.1",
      "question": "Every time a desktop is unplugged, its date and time reset to a date years ago. What is the most likely cause?",
      "choices": ["Failing power supply", "Dead CMOS battery", "Corrupt OS", "Bad RAM"],
      "answer": 1,
      "explanation": "The CMOS coin-cell battery keeps the clock and firmware settings running without power. Replace it, usually a CR2032."
    },
    {
      "id": "ts-002",
      "objective": "5.1",
      "question": "A technician sees bulging, leaking capacitors on a motherboard. What is the correct action?",
      "choices": ["Update the BIOS", "Replace the motherboard", "Reseat the RAM", "Apply thermal paste"],
      "answer": 1,
      "explanation": "Swollen capacitors are a physical hardware failure. They cause random crashes and instability, so the board should be replaced."
    },
    {
      "id": "ts-003",
      "objective": "5.1",
      "question": "Right after a CPU upgrade, a PC shuts down within minutes of heavy use. What should be checked first?",
      "choices": [
        "The heat sink is seated correctly with thermal paste applied",
        "The monitor cable",
        "The DNS settings",
        "The printer driver"
      ],
      "answer": 0,
      "explanation": "Random shutdowns under load after CPU work usually mean overheating from a poorly seated cooler or missing thermal paste."
    },
    {
      "id": "ts-004",
      "objective": "5.1",
      "question": "A user smells something burning coming from their PC. What should they do first?",
      "choices": [
        "Run a virus scan",
        "Power it off and unplug it immediately",
        "Restart it to see if the smell continues",
        "Open the case while it's running to find the source"
      ],
      "answer": 1,
      "explanation": "A burning smell is a safety issue, often from the PSU or a component. Cut power first, then investigate."
    },
    {
      "id": "ts-005",
      "objective": "5.1",
      "question": "A PC powers on but the screen stays blank, and it gives a series of beeps. What are the beeps?",
      "choices": ["Network errors", "POST error codes", "Printer alerts", "S.M.A.R.T. warnings"],
      "answer": 1,
      "explanation": "POST beep codes report early hardware faults, often RAM or video. Look up the pattern for the specific firmware vendor."
    },
    {
      "id": "ts-006",
      "objective": "5.2",
      "question": "A hard drive has started making repeated clicking sounds. What should the technician do first?",
      "choices": [
        "Defragment the drive",
        "Back up the data immediately, then replace the drive",
        "Run a disk cleanup",
        "Increase the page file size"
      ],
      "answer": 1,
      "explanation": "Clicking often means the drive's read/write heads are failing. Save the data while you still can."
    },
    {
      "id": "ts-007",
      "objective": "5.2",
      "question": "After a second drive is added, a PC displays \"Bootable device not found.\" What is the most likely fix?",
      "choices": [
        "Replace the power supply",
        "Correct the boot order in BIOS/UEFI",
        "Reinstall the network driver",
        "Replace the monitor"
      ],
      "answer": 1,
      "explanation": "Firmware may now be trying to boot from the new, empty drive. Set the OS drive first in the boot order."
    },
    {
      "id": "ts-008",
      "objective": "5.2",
      "question": "A server's RAID 5 array shows \"degraded,\" and the chassis alarm is sounding. What does this mean?",
      "choices": [
        "All data is lost",
        "One drive has failed; the array is running without redundancy and the drive should be replaced",
        "The RAID controller needs a firmware update only",
        "The array is rebuilding normally with no action needed"
      ],
      "answer": 1,
      "explanation": "A degraded RAID 5 has lost one drive and has no protection left. Replace the failed drive so the array can rebuild."
    },
    {
      "id": "ts-009",
      "objective": "5.3",
      "question": "A monitor's power light is on, but it shows \"No signal.\" The cable is firmly connected. What should be checked next?",
      "choices": ["The input source setting", "The CMOS battery", "The DNS server", "The printer spooler"],
      "answer": 0,
      "explanation": "The monitor may be set to a different input (HDMI 1 vs. DisplayPort, for example). Check the input first because it's the quickest fix."
    },
    {
      "id": "ts-010",
      "objective": "5.3",
      "question": "A projector keeps shutting off after about 20 minutes of use. What is the most likely cause?",
      "choices": [
        "Overheating from clogged filters or blocked vents",
        "Wrong screen resolution",
        "A dead pixel",
        "Incorrect color profile"
      ],
      "answer": 0,
      "explanation": "Intermittent projector shutdown is usually thermal protection kicking in. Clean the filters and make sure the vents aren't blocked."
    },
    {
      "id": "ts-011",
      "objective": "5.3",
      "question": "Text looks fuzzy on a new LCD monitor. What is the most likely fix?",
      "choices": [
        "Set the OS to the monitor's native resolution",
        "Replace the inverter",
        "Degauss the screen",
        "Lower the refresh rate to 30Hz"
      ],
      "answer": 0,
      "explanation": "LCDs look sharp only at their native resolution. Other resolutions get scaled, which blurs the image."
    },
    {
      "id": "ts-012",
      "objective": "5.3",
      "question": "A faint image of a taskbar stays visible on an OLED display even when other content is shown. What is this?",
      "choices": ["Dead pixels", "Burn-in", "Incorrect input source", "Flashing screen"],
      "answer": 1,
      "explanation": "Static images left on screen for long periods can permanently burn in on OLED and plasma displays."
    },
    {
      "id": "ts-013",
      "objective": "5.4",
      "question": "Taps on a tablet register in the wrong spot, and the cursor drifts on its own. What is the most likely issue?",
      "choices": ["Digitizer or touch calibration problem", "Bad Wi-Fi antenna", "Full storage", "Expired SIM"],
      "answer": 0,
      "explanation": "The digitizer turns touches into input. Recalibrate first; if the problem continues, the digitizer may need replacing."
    },
    {
      "id": "ts-014",
      "objective": "5.4",
      "question": "A phone runs hot, the battery drains quickly, data usage has spiked, and there are unfamiliar apps. What is most likely?",
      "choices": ["Swollen battery", "Malware", "Broken screen", "Bad charging port"],
      "answer": 1,
      "explanation": "Unknown apps, high data use, and extra heat and battery drain together point to malware."
    },
    {
      "id": "ts-015",
      "objective": "5.4",
      "question": "A user can't install new apps on their phone. What should be checked first?",
      "choices": ["Available storage space", "Bluetooth pairing", "Screen brightness", "Location services"],
      "answer": 0,
      "explanation": "Low storage is the most common cause. Also check OS compatibility and any MDM restrictions."
    },
    {
      "id": "ts-016",
      "objective": "5.4",
      "question": "A phone charges only when the cable is held at a certain angle. What is the likely cause?",
      "choices": [
        "Malware",
        "A damaged or lint-filled charging port",
        "Wrong APN settings",
        "Digitizer failure"
      ],
      "answer": 1,
      "explanation": "Charging that depends on the cable angle points to the port. Inspect it, clean out lint, or replace the port or cable."
    },
    {
      "id": "ts-017",
      "objective": "5.5",
      "question": "Users on 2.4GHz Wi-Fi lose connection whenever the break-room microwave runs. What is the best fix?",
      "choices": [
        "Move clients to 5GHz or change the AP channel/location",
        "Replace all network cables",
        "Change DNS servers",
        "Disable DHCP"
      ],
      "answer": 0,
      "explanation": "Microwaves cause external interference in the 2.4GHz band. The 5GHz and 6GHz bands avoid it."
    },
    {
      "id": "ts-018",
      "objective": "5.5",
      "question": "VoIP calls sound choppy because packets arrive at uneven intervals. What is this problem called?",
      "choices": ["Port flapping", "Jitter", "APIPA", "Crosstalk"],
      "answer": 1,
      "explanation": "Jitter is variation in packet delay, and voice traffic is very sensitive to it. QoS that prioritizes voice traffic helps."
    },
    {
      "id": "ts-019",
      "objective": "5.5",
      "question": "A switch log shows one port repeatedly going up and down. What is this, and what is a likely cause?",
      "choices": [
        "Jitter; caused by a slow DNS server",
        "Port flapping; often a bad cable, NIC, or duplex mismatch",
        "High latency; caused by satellite internet",
        "Authentication failure; wrong Wi-Fi password"
      ],
      "answer": 1,
      "explanation": "Port flapping is a link that keeps dropping and reconnecting. Check the cable, connectors, NIC, and speed/duplex settings."
    },
    {
      "id": "ts-020",
      "objective": "5.5",
      "question": "A laptop is connected to Wi-Fi but shows \"No internet\" and has a 169.254.x.x address. What is the most likely cause?",
      "choices": [
        "It is not getting an address from DHCP",
        "The DNS server is slow",
        "The browser cache is full",
        "The Wi-Fi is on 5GHz"
      ],
      "answer": 0,
      "explanation": "Limited connectivity with an APIPA address means DHCP didn't respond. Check the DHCP server, its scope, or the connection to it."
    },
    {
      "id": "ts-021",
      "objective": "5.6",
      "question": "Laser-printed pages smudge easily and toner rubs off. Which component is most likely failing?",
      "choices": ["Fuser", "Pickup roller", "Printhead", "Duplexer"],
      "answer": 0,
      "explanation": "The fuser melts toner onto the paper with heat and pressure. If it fails, the toner doesn't stick."
    },
    {
      "id": "ts-022",
      "objective": "5.6",
      "question": "A printer prints pages of random symbols and garbled text. What is the most likely cause?",
      "choices": ["Low toner", "Incorrect or corrupt printer driver", "Paper jam", "Dirty fuser"],
      "answer": 1,
      "explanation": "Garbled print usually means the wrong driver or print language (PCL vs. PostScript). Reinstall the correct driver."
    },
    {
      "id": "ts-023",
      "objective": "5.6",
      "question": "Several print jobs are stuck in the queue and new jobs won't print. What should be done first on the Windows print server?",
      "choices": [
        "Replace the printer",
        "Restart the Print Spooler service and clear the queue",
        "Reinstall Windows",
        "Change the paper tray settings"
      ],
      "answer": 1,
      "explanation": "Restarting the spooler clears a frozen queue. Delete any stuck jobs if they keep blocking it."
    },
    {
      "id": "ts-024",
      "objective": "5.6",
      "question": "A laser printer puts a faint copy of the previous image lower down on each page. What is this called?",
      "choices": ["Speckling", "Ghosting (double/echo images)", "Faded prints", "Multipage misfeed"],
      "answer": 1,
      "explanation": "Ghosting usually means the imaging drum isn't being fully cleaned or discharged between pages. Replace the drum or toner cartridge."
    },
    {
      "id": "ts-025",
      "objective": "5.6",
      "question": "An inkjet printer produces horizontal lines and missing sections in the text. What should be done first?",
      "choices": [
        "Run the printhead cleaning utility",
        "Replace the fuser",
        "Install a maintenance kit",
        "Replace the ribbon"
      ],
      "answer": 0,
      "explanation": "Clogged inkjet nozzles cause lines and gaps. Run the cleaning cycle, then calibrate or align the printheads."
    },
    {
      "id": "ts-026",
      "objective": "5.6",
      "question": "The printer's paper tray is inserted, but the printer reports that it is missing. What should be checked?",
      "choices": [
        "Tray seating, sensors, and tray configuration in the printer settings",
        "The toner level",
        "The DNS record for the printer",
        "The duplex setting"
      ],
      "answer": 0,
      "explanation": "\"Tray not recognized\" usually comes from a badly seated tray, a blocked sensor, or the wrong tray settings in the driver or device."
    }
  ]
});
