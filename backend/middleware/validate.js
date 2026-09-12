import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "بيانات غير صالحة (Validation Error)",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

// Common validation schemas
export const orderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "الاسم مطلوب"),
    phone: z.string().min(6, "رقم الهاتف غير صحيح"),
    city: z.string().min(2, "المدينة مطلوبة"),
    address: z.string().min(3, "العنوان التفصيلي مطلوب"),
    items: z.array(
      z.object({
        product: z.string().min(1, "معرف المنتج مطلوب"),
        name: z.string().optional(),
        quantity: z.number().int().positive("الكمية يجب أن تكون أكبر من 0"),
        price: z.number().nonnegative(),
        size: z.string().optional(),
        color: z.string().optional(),
      })
    ).min(1, "يجب إرسال عنصر واحد على الأقل في السلة"),
    totalAmount: z.number().positive("المبلغ الإجمالي غير صحيح"),
    notes: z.string().optional(),
  }),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, "اسم المنتج مطلوب"),
    description: z.string().optional(),
    price: z.number().positive("السعر يجب أن يكون مبلغا موجبا"),
    originalPrice: z.number().optional(),
    category: z.string().min(1, "التصنيف مطلوب"),
    images: z.array(z.string()).optional(),
    isOffer: z.boolean().optional(),
    inStock: z.boolean().optional(),
    stockCount: z.number().int().nonnegative().optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
  }),
});
