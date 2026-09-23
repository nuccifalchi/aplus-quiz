QUIZ.register({
  "domain": "1.0 Mobile Devices",
  "weight": 13,
  "questions": [
    {
      "id": "mob-001",
      "objective": "1.1",
      "question": "A user reports their laptop's touchpad is being pushed up and the case is bulging near the bottom. What should the technician do first?",
      "choices": [
        "Keep it plugged in so the battery can recalibrate",
        "Power it off, stop using it, and replace the swollen battery",
        "Press the case back into place and reseat the touchpad",
        "Update the BIOS/UEFI firmware"
      ],
      "answer": 1,
      "explanation": "A swollen lithium-ion battery is a fire risk. Stop using the device, remove and replace the battery, and recycle the old one according to local hazardous-waste rules."
    },
    {
      "id": "mob-002",
      "objective": "1.1",
      "question": "Which memory module form factor is used in most laptops that have upgradeable RAM?",
      "choices": ["DIMM", "SODIMM", "RIMM", "M.2"],
      "answer": 1,
      "explanation": "SODIMM (Small Outline DIMM) is the compact module used in laptops and small form factor PCs. Full-size DIMMs are for desktops."
    },
    {
      "id": "mob-003",
      "objective": "1.1",
      "question": "After a laptop screen replacement, Wi-Fi signal is very weak. Where is the most likely problem?",
      "choices": [
        "The antenna leads in the display lid were not reconnected",
        "The RAM was unseated",
        "The keyboard ribbon cable is loose",
        "The CMOS battery is dead"
      ],
      "answer": 0,
      "explanation": "Laptop Wi-Fi antennas usually run through the display lid around the screen. They connect to the wireless card and are easy to disturb during screen work."
    },
    {
      "id": "mob-004",
      "objective": "1.1",
      "question": "Which laptop component would a technician replace to fix a fingerprint reader used for Windows Hello sign-in?",
      "choices": ["Biometric sensor", "Digitizer", "Inverter", "Near-field antenna"],
      "answer": 0,
      "explanation": "A fingerprint reader is a biometric physical security component. It is a separate part from the digitizer (touch input) and the inverter (old CCFL backlights)."
    },
    {
      "id": "mob-005",
      "objective": "1.2",
      "question": "A user wants to pay by tapping their phone on a store's card reader. Which technology does this use?",
      "choices": ["Bluetooth", "NFC", "Wi-Fi Direct", "Infrared"],
      "answer": 1,
      "explanation": "Near-field communication (NFC) works over only a few centimeters, which makes it a good fit for tap-to-pay and badge readers."
    },
    {
      "id": "mob-006",
      "objective": "1.2",
      "question": "What is the main difference between a docking station and a port replicator?",
      "choices": [
        "A port replicator connects wirelessly; a docking station uses a cable",
        "A docking station typically adds extra capabilities such as charging, expansion slots, or drives; a port replicator only duplicates the laptop's ports",
        "A port replicator is only for Apple devices",
        "There is no difference; the terms are interchangeable"
      ],
      "answer": 1,
      "explanation": "Both give a laptop a one-connection desk setup. A port replicator just copies the existing ports, while a docking station usually adds more, such as power, extra ports, or expansion bays."
    },
    {
      "id": "mob-007",
      "objective": "1.2",
      "question": "Which connector is Apple's proprietary 8-pin, reversible connector used on older iPhones?",
      "choices": ["USB-C", "microUSB", "Lightning", "miniUSB"],
      "answer": 2,
      "explanation": "Lightning is Apple's proprietary reversible connector. Newer iPhones have moved to the USB-C standard."
    },
    {
      "id": "mob-008",
      "objective": "1.3",
      "question": "A traveling employee needs internet on their laptop and only has their phone's cellular connection. What should they use?",
      "choices": ["NFC", "Mobile hotspot/tethering", "Location services", "MDM enrollment"],
      "answer": 1,
      "explanation": "A hotspot (or USB/Bluetooth tethering) shares the phone's cellular data connection with other devices."
    },
    {
      "id": "mob-009",
      "objective": "1.3",
      "question": "A company wants to enforce passcodes, push corporate apps, and remotely wipe company data from employee-owned phones. What should it deploy?",
      "choices": ["A VPN concentrator", "Mobile device management (MDM)", "A RADIUS server", "An eSIM profile"],
      "answer": 1,
      "explanation": "MDM enforces policies, deploys corporate applications, and can wipe devices remotely. It supports both corporate-owned and BYOD configurations."
    },
    {
      "id": "mob-010",
      "objective": "1.3",
      "question": "When pairing a phone with a car's Bluetooth system for the first time, what is typically required to complete pairing?",
      "choices": [
        "An IP address",
        "A matching PIN or passkey confirmation",
        "The car's MAC address typed in manually",
        "An NFC tag"
      ],
      "answer": 1,
      "explanation": "The pairing steps are: enable Bluetooth, make the device discoverable, find it, enter or confirm the PIN, then test connectivity."
    },
    {
      "id": "mob-011",
      "objective": "1.3",
      "question": "What is an eSIM?",
      "choices": [
        "A removable SIM card smaller than a nano-SIM",
        "A SIM built into the device that can be provisioned with a carrier profile digitally",
        "An encrypted SIM used only for 5G",
        "Software that emulates a SIM on a laptop"
      ],
      "answer": 1,
      "explanation": "An embedded SIM (eSIM) is soldered into the device. Carrier profiles are downloaded to it, so there's no physical card to swap."
    },
    {
      "id": "mob-012",
      "objective": "1.3",
      "question": "A user hits their monthly cellular data cap every month because their phone uploads photos to cloud storage. What is the best fix?",
      "choices": [
        "Disable location services",
        "Set cloud sync to use Wi-Fi only",
        "Replace the SIM card",
        "Turn off Bluetooth"
      ],
      "answer": 1,
      "explanation": "Recognizing data caps is part of mobile sync. Limiting large syncs to Wi-Fi keeps them from using up cellular data."
    }
  ]
});
