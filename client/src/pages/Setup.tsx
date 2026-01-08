import { useForm } from "react-hook-form";
import { useCreateVendor } from "@/hooks/use-vendors";
import { useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

// Schema for the form
const setupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessCategory: z.string().min(1, "Select a category"),
  targetAudience: z.enum(["local", "young", "general"]),
  budget: z.enum(["zero", "low", "medium"]),
  timeAvailability: z.enum(["< 5 hrs", "5-10 hrs", "> 10 hrs"]),
  growthGoal: z.enum(["visibility", "sales", "expansion"]),
  instagramUrl: z
    .string()
    .url("Enter a valid Instagram URL")
    .optional()
    .or(z.literal("")),

  bio: z.string().optional(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function Setup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
  });
  const createVendor = useCreateVendor();
  const [, setLocation] = useLocation();

  const onSubmit = (data: SetupFormValues) => {
    createVendor.mutate(data, {
      onSuccess: (newVendor) => {
        localStorage.setItem("growguide_vendor_id", String(newVendor.id));
        setLocation("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Let's build your profile
          </h1>
          <p className="text-slate-500 mt-2">
            We need to understand your constraints to build your engine.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Business Name
                </label>
                <input
                  {...register("businessName")}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. Urban Coffee"
                />
                {errors.businessName && (
                  <span className="text-red-500 text-xs">
                    {errors.businessName.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  {...register("businessCategory")}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="food">Food & Beverage</option>
                  <option value="services">Professional Services</option>
                  <option value="tech">Technology</option>
                  <option value="art">Art & Design</option>
                </select>
                {errors.businessCategory && (
                  <span className="text-red-500 text-xs">
                    {errors.businessCategory.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Growth Goal
                </label>
                <select
                  {...register("growthGoal")}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="visibility">Brand Visibility</option>
                  <option value="sales">Increase Sales</option>
                  <option value="expansion">Market Expansion</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["local", "young", "general"].map((opt) => (
                    <label key={opt} className="cursor-pointer">
                      <input
                        type="radio"
                        value={opt}
                        {...register("targetAudience")}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all capitalize">
                        {opt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Budget Constraint
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["zero", "low", "medium"].map((opt) => (
                    <label key={opt} className="cursor-pointer">
                      <input
                        type="radio"
                        value={opt}
                        {...register("budget")}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all capitalize">
                        {opt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Time Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["< 5 hrs", "5-10 hrs", "> 10 hrs"].map((opt) => (
                    <label key={opt} className="cursor-pointer">
                      <input
                        type="radio"
                        value={opt}
                        {...register("timeAvailability")}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all">
                        {opt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Business Bio
              </label>
              <textarea
                {...register("bio")}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
                placeholder="Tell us a bit about what you do..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Instagram Profile (optional)
              </label>

              <input
                {...register("instagramUrl")}
                type="url"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 
               focus:border-primary focus:ring-2 focus:ring-primary/20 
               outline-none transition-all"
                placeholder="https://instagram.com/yourbusiness"
              />

              {errors.instagramUrl && (
                <span className="text-red-500 text-xs">
                  {errors.instagramUrl.message}
                </span>
              )}
            </div>

            <button
              disabled={createVendor.isPending}
              type="submit"
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createVendor.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  Generate Growth Engine
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
