QUIZ.register({
  "domain": "3.0 Hardware",
  "weight": 25,
  "questions": [
    {
      "id": "hw-001",
      "objective": "3.1",
      "question": "Which display technology produces its own light per pixel and needs no backlight?",
      "choices": ["IPS LCD", "TN LCD", "OLED", "Mini-LED"],
      "answer": 2,
      "explanation": "Each OLED pixel emits its own light, which gives true blacks. LCD types, including Mini-LED, rely on a backlight."
    },
    {
      "id": "hw-002",
      "objective": "3.1",
      "question": "A graphic designer needs an LCD with the most accurate color and widest viewing angles. Which panel type fits best?",
      "choices": ["TN", "IPS", "VA", "CCFL"],
      "answer": 1,
      "explanation": "IPS panels have the best color accuracy and viewing angles among LCDs. TN is fast but has poor viewing angles, and VA falls in between with strong contrast."
    },
    {
      "id": "hw-003",
      "objective": "3.2",
      "question": "Network cable will run through the air-handling space above a drop ceiling. What type of cable is required?",
      "choices": ["Direct burial", "Plenum-rated", "Coaxial", "Unshielded PVC"],
      "answer": 1,
      "explanation": "Plenum-rated jackets resist fire and produce less toxic smoke, as fire codes require in air-handling spaces."
    },
    {
      "id": "hw-004",
      "objective": "3.2",
      "question": "Which fiber type supports the longest distances?",
      "choices": ["Multimode", "Single-mode", "Shielded twisted pair", "Cat 6a"],
      "answer": 1,
      "explanation": "Single-mode fiber has a narrow core and a laser light source, so it can run for kilometers. Multimode covers shorter runs."
    },
    {
      "id": "hw-005",
      "objective": "3.2",
      "question": "Which connector is used to attach coaxial cable to a cable modem?",
      "choices": ["RJ45", "RJ11", "F-type", "LC"],
      "answer": 2,
      "explanation": "Cable modems and TV coax use the screw-on F-type connector. RJ11 is for phone lines and DSL, and LC is a fiber connector."
    },
    {
      "id": "hw-006",
      "objective": "3.2",
      "question": "Which wiring standards define the pin order for RJ45 connectors?",
      "choices": ["T568A/T568B", "802.3af/at", "DB9/DB25", "SATA/eSATA"],
      "answer": 0,
      "explanation": "T568A and T568B are the two pinout standards. Using the same one on both ends makes a straight-through cable."
    },
    {
      "id": "hw-007",
      "objective": "3.3",
      "question": "Which type of RAM detects and corrects single-bit memory errors and is common in servers?",
      "choices": ["SODIMM", "ECC", "Non-ECC", "DDR2"],
      "answer": 1,
      "explanation": "Error-correcting code (ECC) memory fixes single-bit errors. The motherboard and CPU must support it."
    },
    {
      "id": "hw-008",
      "objective": "3.3",
      "question": "A user installs two matching DIMMs in the same-colored slots on a motherboard. What does this typically enable?",
      "choices": ["ECC", "Dual-channel memory", "RAID 1", "Hyper-threading"],
      "answer": 1,
      "explanation": "Matched modules in paired slots run in dual-channel mode, which roughly doubles memory bandwidth."
    },
    {
      "id": "hw-009",
      "objective": "3.4",
      "question": "Which RAID level uses striping with parity, needs at least three drives, and survives one drive failure?",
      "choices": ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
      "answer": 2,
      "explanation": "RAID 5 stripes data with distributed parity. RAID 6 uses double parity to survive two failures and needs four drives."
    },
    {
      "id": "hw-010",
      "objective": "3.4",
      "question": "How much fault tolerance does RAID 0 provide?",
      "choices": ["One drive can fail", "Two drives can fail", "None; losing any drive loses the array", "Half the drives can fail"],
      "answer": 2,
      "explanation": "RAID 0 only stripes, for speed. If any drive fails, all the data is lost."
    },
    {
      "id": "hw-011",
      "objective": "3.4",
      "question": "An M.2 NVMe SSD communicates over which bus?",
      "choices": ["SATA", "PCIe", "SAS", "USB"],
      "answer": 1,
      "explanation": "NVMe runs over PCIe lanes, so it is much faster than SATA. Some M.2 drives use SATA, so check which the slot supports."
    },
    {
      "id": "hw-012",
      "objective": "3.4",
      "question": "What is a common spindle speed for desktop hard drives?",
      "choices": ["1,200 RPM", "7,200 RPM", "25,000 RPM", "100,000 RPM"],
      "answer": 1,
      "explanation": "Typical speeds are 5,400 and 7,200 RPM for desktops and laptops, and 10,000-15,000 RPM for enterprise drives."
    },
    {
      "id": "hw-013",
      "objective": "3.5",
      "question": "Which UEFI feature helps stop rootkits by allowing only signed boot loaders to run?",
      "choices": ["Secure Boot", "BIOS password", "USB permissions", "Fan control"],
      "answer": 0,
      "explanation": "Secure Boot checks the digital signatures of boot components before loading them."
    },
    {
      "id": "hw-014",
      "objective": "3.5",
      "question": "Which motherboard chip securely stores the encryption keys used by BitLocker?",
      "choices": ["HSM", "TPM", "CMOS", "UEFI"],
      "answer": 1,
      "explanation": "A Trusted Platform Module (TPM) is a chip on the motherboard. An HSM is a separate device, often a network appliance, that manages keys for many systems."
    },
    {
      "id": "hw-015",
      "objective": "3.5",
      "question": "A Type 1 hypervisor fails to install, saying hardware virtualization is unavailable. What should be checked first?",
      "choices": [
        "Virtualization support (Intel VT-x/AMD-V) in BIOS/UEFI",
        "The boot password",
        "The fan curve",
        "The TPM ownership"
      ],
      "answer": 0,
      "explanation": "Hardware virtualization is often turned off by default and must be enabled in firmware."
    },
    {
      "id": "hw-016",
      "objective": "3.5",
      "question": "Which motherboard form factor is the smallest?",
      "choices": ["ATX", "microATX", "Mini-ITX", "Extended ATX"],
      "answer": 2,
      "explanation": "Mini-ITX boards (17 cm x 17 cm) are for compact builds. microATX is mid-size and ATX is the full-size standard."
    },
    {
      "id": "hw-017",
      "objective": "3.5",
      "question": "After replacing a CPU, what must be applied between the CPU and the heat sink?",
      "choices": ["Thermal paste or a thermal pad", "Electrical tape", "Dielectric grease", "Nothing; direct metal contact is best"],
      "answer": 0,
      "explanation": "Thermal paste fills tiny gaps so heat moves into the heat sink. Without it the CPU overheats."
    },
    {
      "id": "hw-018",
      "objective": "3.6",
      "question": "Which power supply output voltage powers most CPUs and graphics cards?",
      "choices": ["3.3V", "5V", "12V", "120V"],
      "answer": 2,
      "explanation": "The 12V rail powers high-draw parts like the CPU, GPU, and drive motors. 3.3V and 5V feed logic and older devices."
    },
    {
      "id": "hw-019",
      "objective": "3.6",
      "question": "What is the advantage of a modular power supply?",
      "choices": [
        "It can run on 110V or 220V",
        "Only the cables you need are attached, reducing clutter and improving airflow",
        "It includes a backup battery",
        "It provides two PSUs in one for failover"
      ],
      "answer": 1,
      "explanation": "Modular PSUs have detachable cables. Failover comes from a redundant PSU, not a modular one."
    },
    {
      "id": "hw-020",
      "objective": "3.7",
      "question": "Which page description language is device-independent and preferred for high-quality graphics?",
      "choices": ["PCL", "PostScript", "HTML", "ESC/P"],
      "answer": 1,
      "explanation": "PostScript describes the page independently of the printer, which suits graphics and design work. PCL is faster and common in office printers."
    },
    {
      "id": "hw-021",
      "objective": "3.7",
      "question": "Staff need to scan documents on a multifunction printer and have them saved to a shared folder on the network. Which scan service should be configured?",
      "choices": ["Scan to SMB", "Scan to USB", "Fax", "Duplex"],
      "answer": 0,
      "explanation": "Scan to SMB saves directly to a network share. Other network scan options are email and cloud services."
    },
    {
      "id": "hw-022",
      "objective": "3.8",
      "question": "What does a laser printer maintenance kit typically contain?",
      "choices": [
        "Toner and paper",
        "A fuser assembly and replacement rollers",
        "Ink cartridges and printheads",
        "A ribbon and multipart paper"
      ],
      "answer": 1,
      "explanation": "Maintenance kits replace wear parts like the fuser and the pickup and transfer rollers. Reset the page counter afterward."
    },
    {
      "id": "hw-023",
      "objective": "3.8",
      "question": "Which printer type uses a ribbon and can print on multipart carbon-copy forms?",
      "choices": ["Laser", "Inkjet", "Thermal", "Impact"],
      "answer": 3,
      "explanation": "Impact (dot-matrix) printers strike a ribbon, which is how they print through multipart forms. Maintenance means replacing the ribbon, printhead, and paper."
    },
    {
      "id": "hw-024",
      "objective": "3.8",
      "question": "A thermal receipt printer's output is getting faint and streaky. What is appropriate maintenance?",
      "choices": [
        "Replace the toner",
        "Clean the heating element with isopropyl alcohol and remove debris",
        "Replace the ink ribbon",
        "Run a printhead nozzle check"
      ],
      "answer": 1,
      "explanation": "Thermal printers use heat-sensitive paper and a heating element. Cleaning the element and clearing debris is standard maintenance."
    }
  ]
});
