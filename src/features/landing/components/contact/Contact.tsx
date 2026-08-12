"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Clock3, Mail, MapPin, Phone, SendHorizontal } from "lucide-react";
import {
  supportSchema,
  type SupportFormData,
} from "@/features/landing/schemas/support.schema";
import { supportService } from "@/features/landing/services/support.service";

const contactItems = [
  {
    label: "Phone Number",
    value: "+234 813 912 6624",
    icon: Phone,
  },
  {
    label: "Email Address",
    value: "info@vulnwatch.com.ng",
    icon: Mail,
  },
  {
    label: "Opening Hour",
    value: "Mon - Fri: 9:00 AM - 5:00 PM",
    icon: Clock3,
    emphasize: true,
  },
  {
    label: "Our Location",
    value: "Lagos, Nigeria",
    icon: MapPin,
  },
];

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    mode: "onBlur",
  });

  const onInvalid = () => {
    toast.error("Please fill out all fields correctly before sending.");
  };

  const onSubmit = async (data: SupportFormData) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone,
        requestType: data.requestType,
        content: data.message,
      };

      const response = await supportService.submit(payload);

      if (response.ok) {
        toast.success("Thanks for reaching out. We will get back to you soon.");
        reset();
      } else {
        const message =
          typeof response.data === "object" && response.data
            ? (response.data as { message?: string }).message
            : undefined;
        toast.error(message || "Unable to submit your request right now.");
      }
    } catch {
      toast.error("Unable to submit your request right now.");
    }
  };

  return (
    <main className="bg-white">
      <section className="flex min-h-[256px] items-center bg-gradient-to-b from-white via-[#F5FFF0] to-[#E4FFD8] px-4 py-10 text-center md:py-16">
        <div className="mx-auto max-w-[920px]">
          <h1 className="font-geist text-[32px] leading-[40px] font-bold tracking-[-1px] text-[#2B2B2BE5] md:text-[56px] md:leading-[64px] md:tracking-[-1.5px]">
            Contact us
          </h1>
          <p className="mx-auto mt-4 text-[15px] leading-[24px] tracking-[-0.8px] text-[#2B2B2B] md:text-[18px] md:leading-[30px]">
            Do you have any question or need help with your domain? Our team is
            ready to assist you with professional solutions and reliable
            support. Feel free to contact us anytime and we will respond as
            quick as possible.
          </p>
        </div>
      </section>

      <section className="px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="mx-auto grid max-w-[1120px] gap-6 lg:grid-cols-[1fr_1.15fr]">
          <article className="min-h-[438px] rounded-xl border border-[#D9D9D9] bg-white p-6 md:p-8">
            <h2 className="font-geist text-[28px] leading-[36px] font-semibold tracking-[-1.2px] text-[#2B2B2B] md:text-[32px] md:leading-[40px]">
              Contact Information
            </h2>
            <p className="mt-4 max-w-[460px] text-[16px] leading-[26px] tracking-[-0.6px] text-[#2B2B2B] md:text-[17px] md:leading-[28px]">
              Feel free to contact us anytime and we will respond as quick as
              possible.
            </p>

            <div className="mt-10 divide-y divide-[#DCDCDC]">
              {contactItems.map(({ label, value, icon: Icon, emphasize }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 py-5 first:pt-0"
                >
                  <span className="text-primary mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-inter text-[16px] leading-[24px] font-medium tracking-[-0.6px] text-[#000000] md:text-[18px] md:leading-[26px]">
                      {label}
                    </h3>
                    <p
                      className={`font-inter mt-1 text-[13px] leading-[20px] tracking-[-0.4px] text-[#666666] md:text-[14px] ${
                        emphasize ? "text-[#2B2B2B]" : ""
                      }`}
                    >
                      {label === "Opening Hour" ? (
                        <>
                          Mon - Fri:{" "}
                          <span className="font-bold">9:00 AM - 5:00 PM</span>
                        </>
                      ) : (
                        value
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="min-h-[438px] rounded-xl border border-[#DCDCDC] bg-[#F1FCEA] p-6 md:p-8">
            <h2 className="font-geist text-[28px] leading-[36px] font-semibold tracking-[-1.2px] text-[#2B2B2B] md:text-[32px] md:leading-[40px]">
              Get In Touch
            </h2>
            <p className="mt-4 text-[16px] leading-[26px] tracking-[-0.6px] text-[#666666] md:text-[17px] md:leading-[28px]">
              We would love to hear about your project and help secure your
              website. Fill out the contact form and our team will get back to
              you soon with the best possible solution for your needs.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit, onInvalid)}>
              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <label className="sr-only" htmlFor="contact-name">
                  Name
                </label>
                <input
                  id="contact-name"
                  {...register("name")}
                  type="text"
                  placeholder="Name"
                  className="focus:border-primary h-[46px] rounded-[10px] border border-[#DCDCDC] bg-white px-3 text-[14px] font-semibold text-[#2B2B2B] transition-colors outline-none placeholder:text-[#999999]"
                />

                <label className="sr-only" htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  {...register("email")}
                  type="email"
                  placeholder="Email Address"
                  className="focus:border-primary h-[46px] rounded-[10px] border border-[#DCDCDC] bg-white px-3 text-[14px] font-semibold text-[#2B2B2B] transition-colors outline-none placeholder:text-[#999999]"
                />

                <label className="sr-only" htmlFor="contact-phone">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="Phone Number"
                  className="focus:border-primary h-[46px] rounded-[10px] border border-[#DCDCDC] bg-white px-3 text-[14px] font-semibold text-[#2B2B2B] transition-colors outline-none placeholder:text-[#999999]"
                />

                <label className="sr-only" htmlFor="contact-service">
                  Service You&#39;re Interested
                </label>
                <select
                  id="contact-service"
                  {...register("requestType")}
                  defaultValue=""
                  className="focus:border-primary h-[46px] rounded-[10px] border border-[#DCDCDC] bg-white px-3 text-[14px] font-semibold text-[#888888] transition-colors outline-none"
                >
                  <option value="" disabled>
                    Service You&#39;re Interested
                  </option>
                  <option value="domain-monitoring">Domain Monitoring</option>
                  <option value="vulnerability-scan">Vulnerability Scan</option>
                  <option value="security-consulting">
                    Security Consulting
                  </option>
                </select>
              </div>

              <label className="sr-only" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                {...register("message")}
                placeholder="Message"
                className="focus:border-primary min-h-[160px] w-full resize-none rounded-[10px] border border-[#DCDCDC] bg-white px-3 py-3 text-[14px] font-semibold text-[#2B2B2B] transition-colors outline-none placeholder:text-[#999999]"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary inline-flex h-[46px] items-center gap-3 rounded-[10px] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <span className="text-primary flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
                  <SendHorizontal
                    className="h-4 w-4 -rotate-20 text-[#072E28]"
                    strokeWidth={2}
                  />
                </span>
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
