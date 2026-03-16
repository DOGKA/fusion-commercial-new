"use client";

import { useState } from "react";

export default function SocialSettings() {
  const [socials, setSocials] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  });

  const platforms = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "twitter", label: "Twitter" },
    { key: "youtube", label: "YouTube" },
    { key: "linkedin", label: "LinkedIn" },
  ];

  return (
    <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Sosyal Medya Bağlantıları</h2>
      <div className="space-y-4 max-w-md">
        {platforms.map((platform) => (
          <div key={platform.key}>
            <label className="mb-2 block text-sm font-medium">{platform.label}</label>
            <input
              type="text"
              placeholder={`https://${platform.label.toLowerCase()}.com/...`}
              value={socials[platform.key as keyof typeof socials]}
              onChange={(e) => setSocials({ ...socials, [platform.key]: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
