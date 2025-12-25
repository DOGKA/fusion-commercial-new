"use client";

import { useState } from "react";
import GeneralSettings from "@/components/Settings/GeneralSettings";
import ShippingSettings from "@/components/Settings/ShippingSettings";
import PaymentSettings from "@/components/Settings/PaymentSettings";
import EmailSettings from "@/components/Settings/EmailSettings";
import SocialSettings from "@/components/Settings/SocialSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  
  // General & Email settings state
  const [settings, setSettings] = useState({
    // General
    siteName: "FusionMarkt",
    siteUrl: "https://fusionmarkt.com",
    contactEmail: "info@fusionmarkt.com",
    phone: "+90 555 123 4567",
    address: "İstanbul, Türkiye",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    // Email
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    // Payment
    paymentIyzico: true,
    paymentBank: true,
    paymentCod: false,
  });

  const handleSettingsChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "general", label: "Genel" },
    { id: "shipping", label: "Kargo" },
    { id: "payment", label: "Ödeme" },
    { id: "email", label: "E-posta" },
    { id: "social", label: "Sosyal Medya" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Genel Ayarlar</h1>
        <p className="text-gray-500">Site ayarlarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-stroke dark:border-dark-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "general" && (
        <GeneralSettings
          settings={{
            siteName: settings.siteName,
            siteUrl: settings.siteUrl,
            contactEmail: settings.contactEmail,
            phone: settings.phone,
            address: settings.address,
            currency: settings.currency,
            timezone: settings.timezone,
          }}
          onChange={handleSettingsChange}
        />
      )}

      {activeTab === "shipping" && <ShippingSettings />}

      {activeTab === "payment" && (
        <PaymentSettings
          settings={{
            paymentIyzico: settings.paymentIyzico,
            paymentBank: settings.paymentBank,
            paymentCod: settings.paymentCod,
          }}
          onChange={(key, value) => handleSettingsChange(key, value)}
        />
      )}

      {activeTab === "email" && (
        <EmailSettings
          settings={{
            smtpHost: settings.smtpHost,
            smtpPort: settings.smtpPort,
            smtpUser: settings.smtpUser,
            smtpPass: settings.smtpPass,
          }}
          onChange={handleSettingsChange}
        />
      )}

      {activeTab === "social" && <SocialSettings />}

      {/* Save Button - sadece shipping dışındaki tab'larda göster */}
      {activeTab !== "shipping" && (
        <div className="flex justify-end">
          <button className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90">
            Kaydet
          </button>
        </div>
      )}
    </div>
  );
}
