import Captcha from "@/components/Captcha";
import { useState } from "react";

export default function Home() {
	const [captchaOpen, setCaptchaOpen] = useState(false);
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div>
        <div className="flex items-center p-3 bg-gray-300 rounded-md">
          <input type="checkbox" className="w-10 h-10 bg-gray-300" onClick={(e) => {
						e.preventDefault();
						setCaptchaOpen(true);
					}}/>
          <div className="ml-3">
            <div className="text-gray-700 font-semibold">Verify yourself</div>
          </div>
					<img src="/logo.jfif" alt="logo" className="w-10 h-10 ml-3 rounded-full" />
        </div>
      </div>
			<Captcha/>
    </div>
  );
}
