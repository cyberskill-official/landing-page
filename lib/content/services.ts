import type { LocalizedString } from "@/lib/i18n/types";

export type ServiceDetail = {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  lead: LocalizedString;
  forWho: LocalizedString;
  summary: LocalizedString;  // TASK-CMS-005: Concise description of the practice
  problem: LocalizedString;  // TASK-CMS-005: The core operational bottlenecks it addresses
  approach: LocalizedString; // TASK-CMS-005: Our engineering and integration methodology
  scopeIntro: LocalizedString;
  scopeItems: { title: LocalizedString; description: LocalizedString }[];
  processIntro: LocalizedString;
  processSteps: { title: LocalizedString; body: LocalizedString }[];
  timeline: LocalizedString;
  engagementIntro: LocalizedString;
  engagementModels?: { title: LocalizedString; description: LocalizedString; startingRange?: LocalizedString; timeline?: LocalizedString }[];
  stack: LocalizedString;
  cta: LocalizedString;      // TASK-CMS-005: The outcome-oriented next step for the prospect
  faqs: { q: LocalizedString; a: LocalizedString }[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "web-apps": {
    metaTitle: {
      en: "Web Application Development Services | CyberSkill",
      vi: "Phát triển ứng dụng web | CyberSkill",
    },
    metaDescription: {
      en: "Custom web application development in Ho Chi Minh City. Next.js, React, TypeScript. We design, build, and hand over secure, high-performance dashboards, SaaS platforms, and enterprise web solutions.",
      vi: "Phát triển ứng dụng web theo yêu cầu tại TP.HCM với Next.js, React, TypeScript. Thiết kế, xây và bàn giao bảng điều khiển an toàn, nền tảng SaaS chạy ổn.",
    },
    summary: {
      en: "Custom web applications designed to load instantly, scale seamlessly, and preserve core business logic without technical debt.",
      vi: "Ứng dụng web riêng, tải nhanh, mở rộng được, giữ logic kinh doanh cốt lõi mà không để lại nợ kỹ thuật."
    },
    problem: {
      en: "Many organizations struggle with fragmented workflows, insecure spreadsheets, and slow, legacy web tools that delay operations and compromise critical company data.",
      vi: "Nhiều tổ chức đang kẹt với quy trình rời rạc, bảng tính thiếu bảo mật, và công cụ web cũ chậm, vừa cản vận hành vừa rủi ro dữ liệu."
    },
    approach: {
      en: "We focus on clean server-rendered architectures (HTML-first), rigorous automated test pipelines, and standards-based component development using stable frameworks like React and Next.js.",
      vi: "Chúng tôi ưu tiên kiến trúc render phía máy chủ gọn (HTML trước), kiểm thử tự động nghiêm, và thành phần theo chuẩn với React, Next.js ổn định."
    },
    lead: {
      en: "We design and build production-grade web applications that carry real operational weight. Whether you need an analytics dashboard, a customer portal, a headless e-commerce system, or a multi-tenant SaaS platform, we deliver codebases that ship on time, scale reliably, and remain highly maintainable for years to come.",
      vi: "Chúng tôi thiết kế và xây ứng dụng web sẵn sàng chạy thật. Dù bạn cần bảng điều khiển, cổng khách hàng, thương mại điện tử headless hay nền tảng SaaS nhiều khách thuê, chúng tôi bàn giao đúng hẹn, chạy tin cậy và dễ bảo trì lâu dài.",
    },
    forWho: {
      en: "This service is tailored for mid-market companies that have outgrown the limitations of spreadsheets or off-the-shelf software, startups requiring a robust, production-grade product rather than a throwaway prototype, and enterprise teams seeking to modernize their legacy legacy platforms. We build software that serves as a core commercial asset, ensuring that your business logic is securely preserved and optimized.",
      vi: "Dành cho doanh nghiệp vừa đã vượt quá bảng tính hay phần mềm đóng hộp, startup cần sản phẩm chạy thật thay vì prototype bỏ đi, và đội nội bộ muốn hiện đại hóa hệ thống cũ. Chúng tôi coi phần mềm là tài sản kinh doanh: logic của bạn được giữ kỹ và tối ưu.",
    },
    scopeIntro: {
      en: "Our web development scope covers everything required to take a web application from initial concept to a production-ready system hosted on secure cloud infrastructure.",
      vi: "Phạm vi gồm đủ thứ để đưa ứng dụng web từ ý tưởng đến hệ thống chạy trên đám mây an toàn.",
    },
    scopeItems: [
      {
        title: { en: "High-Performance Frontend Systems", vi: "Giao diện web hiệu năng cao" },
        description: {
          en: "We build user interfaces with Next.js and React that load instantly and provide fluid interactions. We prioritize accessibility (WCAG 2.2 AA) and ensure Core Web Vitals stay in the green to optimize search visibility and user conversion rates.",
          vi: "Giao diện bằng Next.js và React, tải nhanh và thao tác mượt. Ưu tiên tiếp cận (WCAG 2.2 AA) và giữ Core Web Vitals ở ngưỡng xanh để SEO và chuyển đổi không bị hy sinh."
        }
      },
      {
        title: { en: "Secure API and Data Layers", vi: "API và lớp dữ liệu an toàn" },
        description: {
          en: "We design typed API contracts and relational database schemas that protect data integrity. We implement row-level security, clean migrations, and structured indexing to handle growing transaction volumes without latency.",
          vi: "API có kiểm tra kiểu, cơ sở dữ liệu quan hệ bảo vệ toàn vẹn dữ liệu. Bảo mật theo dòng, migration rõ, chỉ mục hợp lý để chịu tải giao dịch tăng dần."
        }
      },
      {
        title: { en: "Third-Party Integrations and Auth", vi: "Tích hợp hệ thống & đăng nhập" },
        description: {
          en: "We wire custom systems into your existing IT landscape, including ERPs, CRMs, payment gateways, and shipping APIs. We implement standard Single Sign-On (SSO), OAuth, and multi-factor authentication for enterprise compliance.",
          vi: "Kết nối hệ thống mới vào hạ tầng hiện có: ERP, CRM, cổng thanh toán, API giao hàng. Đăng nhập một lần (SSO), OAuth và xác thực nhiều lớp khi doanh nghiệp yêu cầu."
        }
      },
      {
        title: { en: "Cloud Deployment and CI/CD Pipelines", vi: "Triển khai đám mây & quy trình phát hành" },
        description: {
          en: "We set up automated deployment pipelines where every commit runs linting, type checks, and unit tests. We package applications using Docker and deploy to AWS, Google Cloud, or Vercel with structured environment variables.",
          vi: "Quy trình triển khai tự động: mỗi commit chạy lint, kiểm tra kiểu và kiểm thử đơn vị. Đóng gói bằng Docker, chạy trên AWS, Google Cloud hoặc Vercel."
        }
      }
    ],
    processIntro: {
      en: "We follow a disciplined, four-step process to ensure that your project is delivered without surprises, scope creep, or operational downtime.",
      vi: "Bốn bước làm việc kỷ luật, để bàn giao không bất ngờ, không phình phạm vi, không dừng hệ thống đang chạy."
    },
    processSteps: [
      {
        title: { en: "1. Discover and Audit", vi: "1. Khám phá & rà soát" },
        body: {
          en: "We spend the first week understanding your existing workflow, interviewing actual users, and analyzing legacy systems. We define success metrics in clear, measurable terms (such as page load time, transaction limits, or administrative hours saved) so that we build exactly what your business requires rather than working on assumptions.",
          vi: "Tuần đầu: hiểu quy trình hiện tại, nói chuyện với người dùng thật, rà hệ thống cũ. Chốt chỉ số thành công đo được (thời gian tải, hạn mức giao dịch, giờ quản lý tiết kiệm) để xây đúng việc doanh nghiệp cần."
        }
      },
      {
        title: { en: "2. Shape and Design", vi: "2. Định hình & thiết kế" },
        body: {
          en: "Before writing any code, we map out the data model, draft API contracts, and create component layouts. We walk you through every technical trade-off (such as performance versus hosting cost, or build versus buy for specific features) so that you can make informed commercial decisions before significant resources are spent.",
          vi: "Trước khi code: phác mô hình dữ liệu, phác API, bố cục thành phần. Mọi đánh đổi kỹ thuật (hiệu năng với chi phí, tự xây với mua) được nói rõ để bạn quyết định thương mại tỉnh táo."
        }
      },
      {
        title: { en: "3. Build and Integrate", vi: "3. Xây dựng & tích hợp" },
        body: {
          en: "We build the application in two-week sprints, deploying to a private staging environment at the end of each cycle. We write automated tests to cover critical user journeys (such as signup, payment, and data exports), ensuring that new features do not regress existing code. You can log in and test the live application at any point.",
          vi: "Xây theo chu kỳ hai tuần, cuối chu kỳ đưa lên môi trường thử riêng. Kiểm thử tự động bao các luồng quan trọng (đăng ký, thanh toán, xuất dữ liệu) để tính năng mới không làm hỏng phần cũ."
        }
      },
      {
        title: { en: "4. Support and Handover", vi: "4. Đồng hành & bàn giao" },
        body: {
          en: "We transition the project to production under a structured release plan. We set up real-time error tracking and application monitoring (using Sentry and Prometheus) to catch runtime issues immediately. Finally, we conduct clean handoff sessions, deliver comprehensive documentation, and train your internal team so that you remain independent.",
          vi: "Chuyển lên môi trường chạy thật theo kế hoạch phát hành rõ. Gắn theo dõi lỗi và giám sát ứng dụng (Sentry, Prometheus). Bàn giao gọn kèm tài liệu đầy đủ và hướng dẫn đội của bạn."
        }
      }
    ],
    timeline: {
      en: "A typical custom web application project takes between 8 to 16 weeks from discovery to production launch. We break this down into: 2 weeks for discovery and technical design, 6 to 12 weeks for active development cycles, and 2 weeks for security audits, integration testing, and production deployment.",
      vi: "Dự án web riêng thường khoảng 8 đến 16 tuần, từ khám phá đến chạy thật: khoảng 2 tuần khám phá và thiết kế, 6–12 tuần phát triển, 2 tuần kiểm bảo mật, tích hợp và phát hành."
    },
    engagementIntro: {
      en: "We offer structured engagement models to align with your business goals, team structure, and budget constraints.",
      vi: "Có các mô hình hợp tác rõ, khớp mục tiêu, đội ngũ và ngân sách của bạn."
    },
    stack: {
      en: "We build our web applications using Next.js and React with TypeScript, styling with Vanilla CSS and component custom properties. The data layer is powered by PostgreSQL or MongoDB, securely deployed on AWS, Google Cloud, or Vercel, with automated backups and monitoring. We pick proven, well-supported technologies over short-lived trends to protect your investment.",
      vi: "Web bằng Next.js và React với TypeScript, CSS thuần và biến CSS. Dữ liệu trên PostgreSQL hoặc MongoDB, chạy trên AWS, Google Cloud hoặc Vercel, có sao lưu và giám sát tự động."
    },
    cta: {
      en: "Tell Lumi your web application requirements and receive a detailed, honest commercial proposal within one business day.",
      vi: "Kể Lumi yêu cầu ứng dụng web của bạn để nhận đề xuất thương mại rõ, trung thực trong một ngày làm việc."
    },
    faqs: [
      {
        q: { en: "Do we own the source code after the project is finished?", vi: "Chúng tôi có sở hữu mã nguồn sau khi dự án kết thúc không?" },
        a: {
          en: "Yes, you own 100% of the custom source code, database structures, configuration files, and assets we build for you. Once final payment is made, the repository ownership is fully transferred to your team under an unrestricted commercial license.",
          vi: "Có. Bạn sở hữu 100% mã nguồn riêng, cấu trúc dữ liệu, cấu hình và tài nguyên chúng tôi xây. Sau thanh toán cuối, kho mã chuyển trọn về đội bạn với giấy phép thương mại không giới hạn."
        }
      },
      {
        q: { en: "How do you ensure the web application is secure?", vi: "Làm thế nào để các bạn đảm bảo ứng dụng web được bảo mật?" },
        a: {
          en: "We apply industry-standard security practices throughout development. This includes writing clean SQL queries to prevent injection attacks, validating all inputs server-side with strict schemas, setting up content security policies (CSP) to stop cross-site scripting (XSS), encrypting sensitive data at rest and in transit, and setting up role-based access control.",
          vi: "Bảo mật đi suốt quá trình phát triển: truy vấn SQL an toàn, kiểm tra dữ liệu đầu vào phía máy chủ, chính sách bảo mật nội dung (CSP) chống XSS, và mã hóa dữ liệu nhạy cảm."
        }
      },
      {
        q: { en: "Can you integrate with our existing CRM, ERP, or legacy database?", vi: "Các bạn có thể tích hợp với CRM, ERP hoặc cơ sở dữ liệu cũ của chúng tôi không?" },
        a: {
          en: "Yes, we regularly build integrations with third-party software and legacy databases. We write custom API wrappers, data synchronization scripts, and batch migration jobs to let your new web application exchange data cleanly with your existing internal systems without breaking operations.",
          vi: "Có. Chúng tôi thường tích hợp phần mềm bên thứ ba và hệ thống cũ: lớp API riêng, đồng bộ dữ liệu, migration hàng loạt để web mới trao đổi dữ liệu sạch với hệ thống đang chạy."
        }
      },
      {
        q: { en: "How do we check progress during the build?", vi: "Làm thế nào để chúng tôi kiểm tra tiến độ trong khi xây dựng?" },
        a: {
          en: "Every two weeks, we host a sprint review call to demonstrate working features. We also provide you with access to a secure staging environment where you can interact with the app in real time as we build it. You can see the progress reflected directly in working software, not just status reports.",
          vi: "Hai tuần một lần chúng tôi demo tính năng đang chạy. Bạn cũng vào được môi trường thử an toàn để tự dùng ứng dụng trong lúc chúng tôi xây."
        }
      },
      {
        q: { en: "What hosting platforms do you recommend and who pays for them?", vi: "Các bạn đề xuất nền tảng lưu trữ nào và ai chi trả chi phí đó?" },
        a: {
          en: "We recommend hosting on Vercel for the frontend and AWS or Google Cloud for backend APIs and databases. We set up all accounts directly under your organization so that you maintain direct financial control over your infrastructure, and we help you configure budget alerts to prevent unexpected bills.",
          vi: "Thường dùng Vercel cho phần giao diện, AWS hoặc Google Cloud cho API và dữ liệu. Tài khoản đặt dưới tổ chức của bạn để bạn giữ kiểm soát chi phí và cảnh báo ngân sách."
        }
      }
    ],
  },
  "mobile-apps": {
    metaTitle: {
      en: "Mobile Application Development Services | CyberSkill",
      vi: "Phát triển ứng dụng di động iOS & Android | CyberSkill",
    },
    metaDescription: {
      en: "Bilingual mobile app development in Ho Chi Minh City. React Native, Flutter, Swift, Kotlin. We build offline-friendly, secure mobile apps with automated store release pipelines.",
      vi: "Phát triển app iOS & Android tại TP.HCM với React Native, Flutter, Swift, Kotlin. Ưu tiên dùng khi mất mạng, bảo mật chặt.",
    },
    summary: {
      en: "Bilingual iOS and Android apps utilizing shared codebases for efficiency, native paths where performance counts, with offline syncing built-in.",
      vi: "App iOS và Android dùng chung mã khi hợp lý, native ở chỗ cần hiệu năng, đồng bộ ngoại tuyến gắn sẵn."
    },
    problem: {
      en: "Mobile apps often fail due to poor offline signal handling, high battery drain, memory leaks, and complicated store deployment processes.",
      vi: "App hay hỏng vì xử lý mất sóng kém, hao pin, rò bộ nhớ, và quy trình lên store rối."
    },
    approach: {
      en: "We build native-quality apps with cross-platform frameworks, write clean native bridges when hardware access requires, and deploy using automated Fastlane pipelines.",
      vi: "Chúng tôi làm app chất lượng gần native bằng framework đa nền tảng, viết cầu nối native gọn khi cần phần cứng, phát hành bằng Fastlane tự động."
    },
    lead: {
      en: "We build mobile applications that remain reliable in the hands of users on the move. From public store apps on iOS and Android to enterprise field tooling, we deliver high-performance applications designed to work under weak network signals, integrate seamlessly with hardware features, and ship with crash reporting and analytics from day one.",
      vi: "Chúng tôi xây app tin cậy khi người dùng đang di chuyển. Từ app trên App Store và Google Play đến công cụ nội bộ, sản phẩm chạy tốt khi mạng yếu và gắn được phần cứng khi cần."
    },
    forWho: {
      en: "This service is built for product teams launching consumer services, operational businesses requiring a dedicated tool for field staff (such as logistics coordinators or site inspectors), and brands establishing loyalty programs. We help you choose the right approach - cross-platform or native - depending on your technical requirements and long-term maintenance resources.",
      vi: "Dành cho đội sản phẩm ra mắt dịch vụ người dùng, doanh nghiệp cần app cho nhân viên hiện trường (điều phối logistics, giám sát công trình), và thương hiệu làm chương trình thân thiết. Chúng tôi giúp chọn đa nền tảng hay native cho đúng."
    },
    scopeIntro: {
      en: "Our mobile development process covers the entire app lifecycle, from device compatibility design to successful publishing and post-launch maintenance.",
      vi: "Bao trọn vòng đời app: từ tương thích thiết bị đến lên store và bảo trì sau ra mắt."
    },
    scopeItems: [
      {
        title: { en: "Cross-Platform and Native Builds", vi: "Đa nền tảng và native" },
        description: {
          en: "We build using React Native or Flutter to target both iOS and Android from a single codebase, saving development cost. For high-performance graphics, complex Bluetooth tasks, or system-level services, we write native Swift or Kotlin code.",
          vi: "React Native hoặc Flutter cho cả iOS và Android từ một mã nguồn, tiết kiệm chi phí. Đồ họa nặng, Bluetooth phức tạp hay dịch vụ hệ thống thì viết Swift hoặc Kotlin native."
        }
      },
      {
        title: { en: "Offline-First Synchronization", vi: "Đồng bộ ưu tiên ngoại tuyến" },
        description: {
          en: "We implement local storage layers (using SQLite or WatermelonDB) to let the app work without an internet connection. When the device goes online, the app runs structured sync cycles that resolve conflicts without losing user data.",
          vi: "Lưu cục bộ (SQLite hoặc WatermelonDB) để app chạy không cần mạng. Khi có mạng, đồng bộ xử lý xung đột mà không mất dữ liệu người dùng."
        }
      },
      {
        title: { en: "Hardware and System Integration", vi: "Tích hợp phần cứng & hệ thống" },
        description: {
          en: "We integrate camera functions for barcode scanning, GPS tracking for geolocation, push notifications for user alerts, and biometrics (Face ID/Touch ID) for secure and fast login experiences.",
          vi: "Tích hợp camera quét mã, GPS, thông báo đẩy, và Face ID/Touch ID để đăng nhập nhanh, an toàn."
        }
      },
      {
        title: { en: "Automated Store Publishing Pipelines", vi: "Phát hành store tự động" },
        description: {
          en: "We set up automated build pipelines using Fastlane to sign, package, and upload builds directly to TestFlight and Google Play Console. This simplifies beta testing and ensures that release day runs smoothly.",
          vi: "Fastlane tự động ký, đóng gói và đẩy bản dựng lên TestFlight và Google Play. Thử nghiệm gọn hơn, ngày ra mắt êm hơn."
        }
      }
    ],
    processIntro: {
      en: "We follow a structured mobile development workflow to deliver stable, high-performance apps that pass store reviews.",
      vi: "Quy trình rõ ràng để app ổn định, nhanh, và dễ qua vòng duyệt store."
    },
    processSteps: [
      {
        title: { en: "1. Device and Signal Audit", vi: "1. Rà thiết bị & sóng mạng" },
        body: {
          en: "We analyze the devices and operating systems your target audience uses and audit network conditions. We design how the application behaves when signal strength drops, defining what data is stored locally and what queries are deferred so that the app remains usable in any environment.",
          vi: "Rà thiết bị và hệ điều hành người dùng thật dùng, cùng điều kiện mạng. Thiết kế app khi sóng yếu: dữ liệu nào lưu máy, truy vấn nào chờ sau."
        }
      },
      {
        title: { en: "2. Contract and Architecture Design", vi: "2. Thiết kế kiến trúc & hợp đồng" },
        body: {
          en: "We design the app architecture to keep business logic separate from UI render states. We draft API schemas and sync contracts, agreeing on how conflicts are resolved (such as server-wins or client-wins) before writing code. This avoids runtime sync errors later.",
          vi: "Tách logic nghiệp vụ khỏi giao diện. Chốt schema API và cách đồng bộ, thống nhất xử lý xung đột (ưu tiên máy chủ hay máy khách) trước khi code."
        }
      },
      {
        title: { en: "3. Beta Testing and Device Verification", vi: "3. Thử beta trên thiết bị thật" },
        body: {
          en: "We deliver working builds to your phone early using TestFlight or Firebase App Distribution. We test the app on physical devices (not just simulators) to verify memory usage, battery drain, and thermal behavior under continuous operation, ensuring that the app remains fast and lightweight.",
          vi: "Đưa bản thử lên máy bạn sớm qua TestFlight hoặc Firebase. Kiểm thử trên máy thật về RAM, pin và nhiệt."
        }
      },
      {
        title: { en: "4. Store Submission and Monitoring", vi: "4. Nộp store & giám sát" },
        body: {
          en: "We manage the submission, metadata preparation, and review processes on both Apple App Store and Google Play Console. Once live, we monitor app stability using real-time crash reporting (such as Firebase Crashlytics) to capture and resolve errors before users post bad reviews.",
          vi: "Lo việc nộp app, metadata và duyệt trên App Store và Google Play. Sau khi live, theo dõi sự cố theo thời gian thực."
        }
      }
    ],
    timeline: {
      en: "A typical custom mobile application takes 12 to 20 weeks to go from initial concept to store launch. Discovery takes 2 weeks, active development cycles take 8 to 14 weeks (including API integration), and the final store submission, regression testing, and review process takes 2 to 4 weeks.",
      vi: "App riêng thường 12 đến 20 tuần từ ý tưởng đến lên store: khoảng 2 tuần khám phá, 8–14 tuần phát triển, 2–4 tuần nộp store và kiểm tra hồi quy."
    },
    engagementIntro: {
      en: "We provide flexible engagement models depending on whether you require a full product team or targeted sprint delivery.",
      vi: "Mô hình hợp tác linh hoạt: cần đội sản phẩm đầy đủ hay bàn giao theo từng đợt."
    },
    stack: {
      en: "We develop cross-platform apps using React Native or Flutter with TypeScript/Dart. For native elements, we use Swift (iOS) and Kotlin (Android). We implement local persistence using SQLite or WatermelonDB and secure communications via HTTPS/WSS. Stability metrics are tracked using Firebase Crashlytics, and build distribution is automated with Fastlane.",
      vi: "Đa nền tảng bằng React Native hoặc Flutter (TypeScript/Dart). Phần native dùng Swift và Kotlin. Lưu máy bằng SQLite hoặc WatermelonDB, kết nối HTTPS/WSS."
    },
    cta: {
      en: "Discuss your iOS or Android app vision with Lumi and let our team map out a structured roadmap for store deployment.",
      vi: "Nói với Lumi ý tưởng app iOS hoặc Android để đội vạch lộ trình lên store rõ ràng."
    },
    faqs: [
      {
        q: { en: "Should we build native (Swift/Kotlin) or cross-platform (React Native/Flutter)?", vi: "Chúng nên xây dựng native (Swift/Kotlin) hay đa nền tảng (React Native/Flutter)?" },
        a: {
          en: "For 90% of business applications, cross-platform (React Native or Flutter) is the best choice because it lets you target both iOS and Android from a single codebase, reducing initial cost and ongoing maintenance. We only recommend native Swift or Kotlin for apps that require high-performance rendering, complex 3D graphics, or advanced system integrations.",
          vi: "Với khoảng 90% app doanh nghiệp, đa nền tảng (React Native hoặc Flutter) là hợp lý: một mã nguồn cho cả iOS và Android, rẻ hơn lúc đầu và lúc bảo trì. Native chỉ khi cần đồ họa 3D nặng hoặc tích hợp hệ thống sâu."
        }
      },
      {
        q: { en: "Who sets up and owns the App Store developer accounts?", vi: "Ai là người thiết lập và sở hữu tài khoản nhà phát triển App Store?" },
        a: {
          en: "You must set up and own the Apple and Google Developer accounts. We guide you through the enrollment process step-by-step. This ensures that you maintain full ownership of your app listing, distribution rights, and customer reviews. We only request developer access to sign and upload the builds.",
          vi: "Bạn sẽ thiết lập và sở hữu tài khoản Nhà phát triển Apple và Google. Chúng tôi sẽ hướng dẫn bạn qua từng bước đăng ký. Điều này đảm bảo bạn duy trì toàn quyền sở hữu thông tin ứng dụng, quyền phân phối và đánh giá của khách hàng."
        }
      },
      {
        q: { en: "How does the app behave when there is no internet connection?", vi: "Ứng dụng sẽ hoạt động thế nào khi không có kết nối internet?" },
        a: {
          en: "We build our apps to be offline-friendly. The application stores vital database records, drafts, and media locally. Users can continue filling out forms, viewing cached information, and performing tasks. Once a connection is detected, the app automatically syncs the offline changes to the server in the background.",
          vi: "Chúng tôi xây dựng ứng dụng thân thiện với chế độ ngoại tuyến. Ứng dụng lưu các bản ghi dữ liệu, bản nháp và tệp đa phương tiện cục bộ trên thiết bị. Người dùng có thể tiếp tục điền biểu mẫu, xem dữ liệu đã lưu. Khi có mạng trở lại, ứng dụng tự động đồng bộ hóa."
        }
      },
      {
        q: { en: "How do you test the app on different mobile phones?", vi: "Các bạn kiểm thử ứng dụng trên các dòng điện thoại khác nhau như thế nào?" },
        a: {
          en: "We use a combination of simulated devices and physical hardware testing. We focus physical testing on a representative set of devices covering popular screen sizes, aspects, OS versions, and hardware specifications (low-end to high-end Android, and recent iPhone models) to verify real-world performance.",
          vi: "Chúng tôi kết hợp thiết bị mô phỏng và kiểm thử trên phần cứng thực tế. Chúng tôi tập trung kiểm thử thực tế trên tập hợp thiết bị đại diện gồm các kích thước màn hình phổ biến, phiên bản hệ điều hành và thông số phần cứng để xác minh hiệu năng thực tế."
        }
      },
      {
        q: { en: "How do you handle application security and data privacy?", vi: "Làm thế nào để các bạn xử lý bảo mật ứng dụng và quyền riêng tư dữ liệu?" },
        a: {
          en: "We secure the mobile app by storing sensitive data (such as login tokens) in the device's secure hardware enclave (iOS Keychain and Android Keystore). We enforce SSL pinning to prevent man-in-the-middle attacks, encrypt all data stored locally, and implement session timeouts to protect user access.",
          vi: "Chúng tôi bảo mật ứng dụng bằng cách lưu dữ liệu nhạy cảm (như token đăng nhập) trong vùng lưu trữ phần cứng an toàn của thiết bị (iOS Keychain và Android Keystore). Chúng tôi áp dụng SSL pinning để ngăn chặn tấn công trung gian."
        }
      }
    ],
  },
  "internal-systems": {
    metaTitle: {
      en: "Custom Internal Software and Business Systems | CyberSkill",
      vi: "Phần mềm nội bộ & hệ thống doanh nghiệp | CyberSkill",
    },
    metaDescription: {
      en: "Operations tooling, automation, and enterprise integrations in Ho Chi Minh City. We replace spreadsheets with a secure database source of truth. Fully documented handover.",
      vi: "Công cụ vận hành, tự động hóa và tích hợp doanh nghiệp tại TP.HCM. Thay bảng tính bằng một nguồn dữ liệu an toàn, thống nhất.",
    },
    summary: {
      en: "Operations dashboards, automation services, and legacy integrations that unify disjointed business data into a single source of truth.",
      vi: "Bảng điều khiển vận hành, tự động hóa và tích hợp hệ thống cũ: gom dữ liệu rời thành một nguồn thống nhất."
    },
    problem: {
      en: "Admin teams are frequently overwhelmed by manual data entry, drifting spreadsheets, and systems that cannot communicate, causing shipping and processing bottlenecks.",
      vi: "Đội hành chính hay quá tải vì nhập tay, bảng tính lệch số, hệ thống không nói chuyện được với nhau, điều phối bị nghẽn."
    },
    approach: {
      en: "We shadow operations teams to map workflows, build secure private cloud databases, implement granular role access control (RBAC), and deploy incremental modules.",
      vi: "Quan sát đội vận hành để vẽ quy trình thật, xây dữ liệu đám mây riêng, phân quyền chi tiết (RBAC), bàn giao từng mô-đun."
    },
    lead: {
      en: "We build the software that keeps a business running smoothly behind the scenes. From custom ERP extensions and logistics coordination portals to internal operations tools and automated data pipelines, we replace error-prone spreadsheets with a single, secure database source of truth that automates manual work and gives hours back to your team.",
      vi: "Phần mềm giúp doanh nghiệp chạy êm phía sau: mở rộng ERP, cổng điều phối logistics, công cụ nội bộ, đường ống dữ liệu tự động. Thay bảng tính bằng một nguồn dữ liệu an toàn."
    },
    forWho: {
      en: "This service is built for operations leaders drowning in manual admin steps, logistics and manufacturing teams coordinating complex workflows across disconnected files, and executives who want a clear, live view of company operations. We design software that adapts to your actual workflow rather than forcing you to change how you run your business.",
      vi: "Dành cho quản lý vận hành ngập việc tay, đội sản xuất và logistics đang phối hợp trên file rời, và ban điều hành muốn nhìn vận hành trực tiếp."
    },
    scopeIntro: {
      en: "Our internal systems scope targets the elimination of operational bottlenecks and the secure integration of disconnected business applications.",
      vi: "Mục tiêu: gỡ điểm nghẽn vận hành và nối các ứng dụng doanh nghiệp rời rạc một cách an toàn."
    },
    scopeItems: [
      {
        title: { en: "Custom Back-Office Tooling", vi: "Công cụ back-office riêng" },
        description: {
          en: "We build web dashboards designed for internal staff to manage inventories, coordinate logistics, process orders, and review customer applications. We prioritize grid efficiency, keyboard shortcuts, and clear status fields.",
          vi: "Bảng điều khiển quản lý kho, điều phối vận chuyển, xử lý đơn, duyệt hồ sơ. Ưu tiên lưới dữ liệu nhanh, phím tắt, trạng thái rõ."
        }
      },
      {
        title: { en: "System Integrations and Pipelines", vi: "Tích hợp hệ thống & đường ống dữ liệu" },
        description: {
          en: "We bridge legacy databases, accounting software, external CRM platforms, and shipping services. We build automated data pipelines that eliminate manual copy-pasting and ensure data remains consistent across platforms.",
          vi: "Nối dữ liệu cũ, phần mềm kế toán, CRM và vận chuyển. Đường ống dữ liệu tự động, bớt copy-paste tay."
        }
      },
      {
        title: { en: "Legacy Database Migrations", vi: "Chuyển cơ sở dữ liệu cũ" },
        description: {
          en: "We normalize, clean, and transfer scattered operational data into structured relational databases (such as PostgreSQL) with minimal operational downtime, setting up indexed queries designed for reporting.",
          vi: "Chuẩn hóa, làm sạch và chuyển dữ liệu rời vào cơ sở quan hệ (PostgreSQL) với thời gian dừng tối thiểu, truy vấn sẵn cho báo cáo."
        }
      },
      {
        title: { en: "Granular Role-Based Access Control", vi: "Phân quyền theo vai trò" },
        description: {
          en: "We secure internal systems using strict role-based permissions, logging all user actions to create an audit trail. We implement Single Sign-On (SSO) using SAML or OpenID Connect to integrate with your existing corporate directory.",
          vi: "Phân quyền theo vai trò (RBAC) chặt, ghi nhật ký hành động để kiểm toán. Đăng nhập một lần (SSO) qua SAML hoặc OpenID Connect khi cần."
        }
      }
    ],
    processIntro: {
      en: "We build internal software incrementally, matching the actual operational rhythms of your staff to avoid disruption.",
      vi: "Xây phần mềm nội bộ từng bước, khớp nhịp vận hành thật của nhân viên, tránh gián đoạn."
    },
    processSteps: [
      {
        title: { en: "1. Workflow Mapping and Shadowing", vi: "1. Quan sát & vẽ quy trình" },
        body: {
          en: "We spend the first week shadowing your operational team, observing exactly how they process orders, reconcile data, or coordinate handovers. We map the spreadsheet sprawl, document the manual checks, and identify the primary bottlenecks that cause errors and delays before proposing a technical solution.",
          vi: "Tuần đầu quan sát đội vận hành: xử lý đơn, đối chiếu dữ liệu. Vẽ chỗ dữ liệu đang rải, ghi bước kiểm tra tay, tìm điểm nghẽn trước khi đề xuất giải pháp."
        }
      },
      {
        title: { en: "2. Schema Audit and Integration Risk Plan", vi: "2. Rà schema & rủi ro tích hợp" },
        body: {
          en: "We audit your existing legacy databases and system APIs. We design a unified database schema and map fields to ensure that the new system integrates safely. We draft a transition risk mitigation plan to ensure that company operations continue running without interruption during deployment.",
          vi: "Rà dữ liệu cũ và API hiện có. Thiết kế schema thống nhất, ánh xạ trường để hệ thống mới nối an toàn, và có kế hoạch giảm rủi ro khi chuyển."
        }
      },
      {
        title: { en: "3. Incremental Launch and Shadow Runs", vi: "3. Ra mắt từng bước, chạy song song" },
        body: {
          en: "We deploy the system in modules, starting with the features that resolve the most painful administrative tasks. We run the new tools in shadow-mode alongside your existing processes, validating data accuracy and system performance against actual transactions before retiring the legacy files.",
          vi: "Triển khai từng mô-đun, ưu tiên việc hành chính đau nhất. Chạy công cụ mới song song quy trình cũ để kiểm tra số liệu trước khi bỏ file cũ."
        }
      },
      {
        title: { en: "4. Corporate Handover and IT Onboarding", vi: "4. Bàn giao & hướng dẫn IT" },
        body: {
          en: "We deliver full system documentation, database schemas, and API mapping guides to your internal IT team. We host structured onboarding sessions to walk your developers and coordinators through system administration, ensuring that you maintain the software in-house without lock-in.",
          vi: "Bàn giao tài liệu hệ thống, schema và API cho đội IT của bạn. Hướng dẫn quản trị để bạn tự chủ phần mềm, không bị khóa chặt."
        }
      }
    ],
    timeline: {
      en: "An internal system or operations tool takes between 10 to 18 weeks. Discovery and workflow shadowing take 2 weeks, database schema design and API integration setup take 2 weeks, module development and shadow testing take 6 to 12 weeks, and corporate IT handover and live deployment take 2 weeks.",
      vi: "Hệ thống nội bộ thường 10 đến 18 tuần: khoảng 2 tuần quan sát quy trình, 2 tuần schema và API, 6–12 tuần phát triển và chạy song song, 2 tuần bàn giao IT."
    },
    engagementIntro: {
      en: "We work under defined scopes or monthly iterations depending on whether you are replacing a legacy platform or building new automation features.",
      vi: "Làm theo phạm vi cố định hoặc theo tháng, tùy bạn đang thay hệ cũ hay thêm tự động hóa."
    },
    stack: {
      en: "We build operations software using custom Next.js admin dashboards with Node.js/TypeScript backend services. We implement PostgreSQL databases for structured operational records and Redis for queue management. We deploy securely inside private cloud subnets on AWS or Google Cloud, integrating with corporate identity providers via SAML/OIDC.",
      vi: "Vận hành bằng dashboard Next.js và backend Node.js/TypeScript. PostgreSQL cho bản ghi có cấu trúc, Redis cho hàng đợi, chạy an toàn trên AWS hoặc Google Cloud."
    },
    cta: {
      en: "Share your business operational bottlenecks with Lumi to discover how custom automation can optimize your team's workflow.",
      vi: "Kể Lumi điểm nghẽn vận hành để xem tự động hóa riêng có giúp đội bạn nhẹ việc thế nào."
    },
    faqs: [
      {
        q: { en: "Can you work with old legacy software that does not have an API?", vi: "Các bạn có thể làm việc với các phần mềm cũ không có API không?" },
        a: {
          en: "Yes. If your legacy software has no API, we look for secure alternative paths. We can write database connection scripts to exchange data directly at the database layer, create automated file exports and imports, or build custom microservices to interface with the old system without risking data loss.",
          vi: "Có. Nếu phần mềm cũ không có API, chúng tôi tìm các hướng đi thay thế an toàn. Chúng tôi có thể viết kịch bản kết nối để trao đổi dữ liệu trực tiếp ở lớp cơ sở dữ liệu, tạo luồng xuất nhập tệp tự động hoặc xây dựng microservice."
        }
      },
      {
        q: { en: "How do you ensure role-based access control and system security?", vi: "Làm thế nào để các bạn đảm bảo phân quyền theo vai trò và bảo mật hệ thống?" },
        a: {
          en: "We implement granular access permissions based on user roles (such as coordinator, manager, auditor, or admin). Each user only accesses the tables and actions necessary for their work. We log every data modification and administrative action to a read-only audit log database, ensuring accountability and compliance.",
          vi: "Chúng tôi triển khai phân quyền chi tiết dựa trên vai trò người dùng (như điều phối viên, quản lý, kiểm toán viên hoặc admin). Mỗi người dùng chỉ truy cập bảng và tác vụ cần thiết. Mọi chỉnh sửa dữ liệu đều được lưu nhật ký kiểm toán."
        }
      },
      {
        q: { en: "Will there be downtime or disruption to our daily business during migration?", vi: "Liệu có xảy ra thời gian dừng hệ thống hay gián đoạn công việc kinh doanh khi di chuyển dữ liệu?" },
        a: {
          en: "We design migrations to minimize operational disruption. We prepare database schemas and sync scripts in staging, and run tests on copy data. When transitioning, we schedule data updates during off-peak hours (nights or weekends) and run the new tool alongside the old process for validation, ensuring zero business interruption.",
          vi: "Chúng tôi thiết kế quy trình di chuyển dữ liệu để giảm thiểu gián đoạn. Chúng tôi chạy thử nghiệm trên bản sao dữ liệu. Khi chuyển đổi thực tế, chúng tôi lên lịch cập nhật vào giờ thấp điểm (đêm hoặc cuối tuần) và chạy song song để kiểm chứng."
        }
      },
      {
        q: { en: "Can we integrate internal tools with active directory or our Google Workspace logins?", vi: "Chúng tôi có thể tích hợp công cụ nội bộ với active directory hoặc đăng nhập Google Workspace không?" },
        a: {
          en: "Yes, we implement standard Single Sign-On (SSO) integrations. We connect the custom internal application to your corporate directory using SAML or OpenID Connect (supporting services like Microsoft Azure AD/Entra ID, Google Workspace, or Okta), letting your staff log in using their existing company credentials.",
          vi: "Có, chúng tôi triển khai tích hợp Đăng nhập một lần (SSO) tiêu chuẩn. Chúng tôi kết nối ứng dụng với danh bạ doanh nghiệp qua SAML hoặc OpenID Connect (hỗ trợ Azure AD, Google Workspace hoặc Okta) để đăng nhập bằng tài khoản công ty sẵn có."
        }
      },
      {
        q: { en: "Do you write user documentation for our team?", vi: "Các bạn có viết tài liệu hướng dẫn sử dụng cho đội ngũ của chúng tôi không?" },
        a: {
          en: "Yes. Along with the technical codebase documentation, we write plain-language user guides for your operations staff. This includes step-by-step instructions, screenshots, and troubleshooting checklists for common operational scenarios, ensuring a smooth transition and fast onboarding for new hires.",
          vi: "Có. Đi kèm tài liệu kỹ thuật, chúng tôi viết tài liệu hướng dẫn sử dụng bằng ngôn ngữ dễ hiểu cho nhân sự vận hành. Tài liệu gồm hướng dẫn từng bước, ảnh chụp màn hình và checklist xử lý sự cố cho các tình huống thường gặp."
        }
      }
    ],
  },
};
