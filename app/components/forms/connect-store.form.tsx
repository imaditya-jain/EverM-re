"use client"

import { yupResolver } from "@hookform/resolvers/yup";
import { Link2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SiShopify } from "react-icons/si";
import { toast } from "react-toastify";
import * as yup from "yup";
import { authFetch } from "@/app/lib/auth-fetch";
import InputField from "../fields/input.field";

type ConnectStoreFormValues = {
  shop: string;
};

const schema = yup.object({
  shop: yup
    .string()
    .trim()
    .required("Shopify store URL is required.")
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/,
      "Enter a valid myshopify.com store domain."
    ),
});

const normalizeShopDomain = (shop: string) =>
  shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/g, "")
    .toLowerCase();

const ConnectStoreForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectStoreFormValues>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const handleConnectStore = async (values: ConnectStoreFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await authFetch("/api/v1/shopify/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shop: normalizeShopDomain(values.shop) }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Unable to connect Shopify store.");
        return;
      }

      window.location.assign(result.data.installUrl);
    } catch (error) {
      console.log(error);
      toast.error("Unable to connect Shopify store.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleConnectStore)} className="mt-7">
      <InputField<ConnectStoreFormValues>
        label="Shopify Store URL"
        name="shop"
        type="text"
        placeholder="your-store.myshopify.com"
        required
        register={register}
        errors={errors}
        leftElement={
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eef8ef] text-[#67b84a]">
            <SiShopify size={15} />
          </span>
        }
        helpText="Enter your Shopify store domain without https://"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 flex h-[45px] w-full min-w-0 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] px-3 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(109,40,217,0.22)] transition hover:shadow-[0_18px_36px_rgba(109,40,217,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Link2 size={16} className="shrink-0" />
        <span className="min-w-0 truncate">
          {isSubmitting ? "Connecting Store" : "Connect Shopify Store"}
        </span>
      </button>
    </form>
  );
};

export default ConnectStoreForm;
