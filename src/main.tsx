
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "./styles/mobile-proportional.css";  // 移动端等比例缩放(自动启用,完全独立)
  import "./styles/mobile.css";                // 移动端细节优化(保持不变)

  createRoot(document.getElementById("root")!).render(<App />);
