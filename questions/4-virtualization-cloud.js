QUIZ.register({
  "domain": "4.0 Virtualization and Cloud Computing",
  "weight": 11,
  "questions": [
    {
      "id": "vc-001",
      "objective": "4.1",
      "question": "Which type of hypervisor runs directly on the hardware without a host operating system?",
      "choices": ["Type 1", "Type 2", "Container engine", "Emulator"],
      "answer": 0,
      "explanation": "Type 1 (bare-metal) hypervisors like ESXi and Hyper-V Server run directly on the hardware. Type 2 hypervisors run as an app on a host OS."
    },
    {
      "id": "vc-002",
      "objective": "4.1",
      "question": "A student installs VirtualBox on their Windows laptop to run Linux. What kind of hypervisor is this?",
      "choices": ["Type 1", "Type 2", "VDI", "SaaS"],
      "answer": 1,
      "explanation": "VirtualBox runs on top of an existing OS, so it's a Type 2 (hosted) hypervisor."
    },
    {
      "id": "vc-003",
      "objective": "4.1",
      "question": "A technician wants to open a suspicious attachment safely without risking the host PC. What VM use case is this?",
      "choices": ["Sandbox", "Load balancing", "Cross-platform virtualization", "Multitenancy"],
      "answer": 0,
      "explanation": "A sandbox isolates untrusted code. If something goes wrong, you can revert or delete the VM."
    },
    {
      "id": "vc-004",
      "objective": "4.1",
      "question": "How do containers differ from virtual machines?",
      "choices": [
        "Containers each include a full guest operating system",
        "Containers share the host OS kernel, making them lighter and faster to start",
        "Containers require a Type 1 hypervisor",
        "Containers cannot run applications"
      ],
      "answer": 1,
      "explanation": "Containers package an app and its dependencies but share the host kernel. VMs each run a complete guest OS."
    },
    {
      "id": "vc-005",
      "objective": "4.1",
      "question": "Employees log in from thin clients to Windows desktops that run on servers in the data center. What is this called?",
      "choices": ["VDI", "IaaS", "Sandbox", "Application streaming"],
      "answer": 0,
      "explanation": "In Virtual Desktop Infrastructure (VDI), desktops run centrally and are accessed remotely."
    },
    {
      "id": "vc-006",
      "objective": "4.1",
      "question": "A business must keep running an old accounting app that only works on Windows XP. What is the safest approach?",
      "choices": [
        "Keep an XP PC connected to the internet",
        "Run XP in an isolated virtual machine",
        "Install the app on a domain controller",
        "Use the app through a public cloud SaaS"
      ],
      "answer": 1,
      "explanation": "Virtualization supports legacy software and operating systems. Isolating the VM on the network reduces the risk of running an unsupported OS."
    },
    {
      "id": "vc-007",
      "objective": "4.2",
      "question": "Which of these is an example of SaaS?",
      "choices": [
        "Renting virtual servers and managing their OS",
        "A web-based email and office suite you just sign in to",
        "A platform to deploy code without managing servers",
        "Colocating your own servers in a data center"
      ],
      "answer": 1,
      "explanation": "With SaaS, the provider runs the whole application and you just use it. IaaS gives you VMs you manage, and PaaS gives you a platform to deploy code on."
    },
    {
      "id": "vc-008",
      "objective": "4.2",
      "question": "A company rents virtual machines, storage, and networking from a cloud provider and installs and patches its own operating systems. Which model is this?",
      "choices": ["SaaS", "PaaS", "IaaS", "Community cloud"],
      "answer": 2,
      "explanation": "In IaaS, the provider supplies the infrastructure and you manage everything from the OS up."
    },
    {
      "id": "vc-009",
      "objective": "4.2",
      "question": "An online store automatically adds servers during a holiday rush and removes them afterward. Which cloud characteristic is this?",
      "choices": ["Multitenancy", "Elasticity", "File synchronization", "Dedicated resources"],
      "answer": 1,
      "explanation": "Elasticity means resources scale up and down automatically with demand, and you pay only for what you use."
    },
    {
      "id": "vc-010",
      "objective": "4.2",
      "question": "A company keeps sensitive data in its own data center but uses a public cloud for its public website. Which cloud model is this?",
      "choices": ["Private", "Public", "Hybrid", "Community"],
      "answer": 2,
      "explanation": "A hybrid cloud combines private and public cloud resources."
    },
    {
      "id": "vc-011",
      "objective": "4.2",
      "question": "A cloud bill shows unexpected charges for data leaving the provider's network. What is this called?",
      "choices": ["Ingress", "Egress", "Elasticity", "Availability"],
      "answer": 1,
      "explanation": "Metered utilization often bills for egress (data out). Ingress (data in) is frequently free."
    },
    {
      "id": "vc-012",
      "objective": "4.2",
      "question": "Several hospitals share a cloud built for their common healthcare compliance needs. What type of cloud is this?",
      "choices": ["Public", "Private", "Hybrid", "Community"],
      "answer": 3,
      "explanation": "A community cloud is shared by organizations with common requirements, such as regulation or mission."
    }
  ]
});
