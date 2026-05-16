"use client"

import { cn } from "@/lib/utils"
import { setVisualEditingAttr as setAttr } from "@/lib/visualEditing"
import DirectusImage from "@/components/shared/DirectusImage"
import ButtonGroup from "@/components/blocks/ButtonGroup"
import type { ButtonProps } from "@/components/blocks/Button"

// --- Types ---

interface StepItem {
    id: string
    sort?: number | null
    title?: string | null
    content?: string | null
    image?: string | { id: string } | null
    bg_color?: string | null
    button_group?: { id: string; buttons?: ButtonProps[] } | null
}

interface StepsProps {
    data: {
        id: string
        title?: string | null
        headline?: string | null
        show_step_numbers?: boolean | null
        alternate_image_position?: boolean | null
        badge_text?: string | null
        author_image?: string | { id: string } | null
        steps?: StepItem[]
    }
}

// --- Helpers ---

function imageId(img: StepItem["image"] | StepsProps["data"]["author_image"]): string | null {
    if (!img) return null
    if (typeof img === "string") return img
    if (typeof img === "object" && "id" in img) return img.id
    return null
}

// --- Defaults ---

const DEFAULT_BADGE = "Quy trình làm việc"
const DEFAULT_TITLE = "Cơ Chế Giải Quyết & Đồng Hành"
const DEFAULT_SUBTITLE =
    "Mọi bài toán phức tạp đều được chúng tôi đơn giản hóa qua quy trình 3 bước minh bạch, chuyên sâu và cá nhân hóa tuyệt đối dưới sự dẫn dắt trực tiếp từ chuyên gia."
const DEFAULT_AUTHOR_IMG = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"

const DEFAULT_STEPS: StepItem[] = [
    {
        id: "fallback-1",
        sort: 1,
        title: "01. Tiếp Nhận Thấu Cảm",
        content:
            "Lắng nghe câu chuyện, phân tích các biến số cốt lõi và khảo sát thực trạng để định vị chính xác nút thắt bạn đang gặp phải.",
        bg_color: "bg-[#1c1917]",
        image: "https://images.unsplash.com/photo-1423662055902-359430b05141?w=400&auto=format&fit=crop&q=60",
    },
    {
        id: "fallback-2",
        sort: 2,
        title: "02. Thiết Kế Lộ Trình",
        content:
            "Xây dựng chiến lược cá nhân hóa, dự toán nguồn lực và thiết lập các cột mốc chuyển hóa rõ ràng, tối ưu chi phí.",
        bg_color: "bg-[#7f1d1d]",
        image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400&auto=format&fit=crop&q=60",
    },
    {
        id: "fallback-3",
        sort: 3,
        title: "03. Triển Khai & Đúc Kết",
        content:
            "Hiện thực hóa giải pháp với sự đồng hành 1-1, nghiệm thu nghiêm ngặt và bàn giao cẩm nang vận hành dài hạn.",
        bg_color: "bg-[#0f172a]",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=60",
    },
]

// --- Constants ---

const CARD_HEIGHT = 520 // px — chiều cao mỗi card
const PEEK = 64 // px — khoảng card trước lộ ra
const BASE_TOP = 80 // px — top cho card trên cùng (card cuối)

// --- Component ---

export default function Steps({ data }: StepsProps) {
    const badge = data.badge_text || DEFAULT_BADGE
    const title = data.title || data.headline || DEFAULT_TITLE
    const subtitle = typeof data.headline === "string" ? data.headline : DEFAULT_SUBTITLE
    const authorImgId = typeof data.author_image === "string" ? data.author_image : imageId(data.author_image)
    const steps = (data.steps && data.steps.length > 0 ? data.steps : DEFAULT_STEPS)
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

    const total = steps.length

    return (
        <section className="w-full py-16 md:py-24 bg-[#FCF5EE] text-stone-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ========== INTRO HEADER ========== */}
                <div className="max-w-3xl mb-12 md:mb-20">
                    <span
                        className="text-xs font-bold uppercase tracking-widest text-red-800 bg-red-50 px-3 py-1 rounded-full"
                        data-directus={setAttr({ collection: "block_steps", item: data.id, fields: ["badge_text"], mode: "popover" })}
                    >
                        {badge}
                    </span>

                    <h2
                        className="text-3xl md:text-5xl font-serif font-bold tracking-tight mt-3 mb-4 text-stone-900"
                        data-directus={setAttr({ collection: "block_steps", item: data.id, fields: ["title"], mode: "popover" })}
                    >
                        {title}
                    </h2>

                    {typeof data.headline === "string" && data.headline.includes("<") ? (
                        <div
                            className="text-base md:text-lg text-stone-600 leading-relaxed prose-p:my-0"
                            data-directus={setAttr({ collection: "block_steps", item: data.id, fields: ["headline"], mode: "popover" })}
                            dangerouslySetInnerHTML={{ __html: data.headline }}
                        />
                    ) : (
                        <p className="text-base md:text-lg text-stone-600 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* ========== 2-SIDE LAYOUT ========== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* SIDE TRÁI: Ảnh Author */}
                    <div className="lg:col-span-5 w-full lg:sticky lg:top-32 self-start">
                        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl border border-stone-200">
                            {authorImgId ? (
                                <DirectusImage
                                    uuid={authorImgId}
                                    alt="Chuyên gia"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <img
                                    src={DEFAULT_AUTHOR_IMG}
                                    alt="Chuyên gia"
                                    className="object-cover w-full h-full absolute inset-0"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* SIDE PHẢI: Stacking cards — top lệch dần, card sau đè card trước, chừa peek */}
                    <div className="lg:col-span-7 w-full">
                        {steps.map((step, index) => {
                            const stepImageId = typeof step.image === "string" ? step.image : imageId(step.image)
                            const stepNumber = data.show_step_numbers
                                ? String(index + 1).padStart(2, "0")
                                : null

                            // Card cuối (trên cùng) top = BASE_TOP, card đầu (dưới) top = BASE_TOP + (total-1)*PEEK
                            const topPx = BASE_TOP + (total - 1 - index) * PEEK

                            return (
                                <div
                                    key={step.id}
                                    className="sticky w-full"
                                    style={{
                                        top: `${topPx}px`,
                                        zIndex: 10 + index,
                                        height: `${CARD_HEIGHT}px`,
                                    }}
                                >
                                    <div
                                        className={cn(
                                            step.bg_color || "bg-[#1c1917]",
                                            "w-full h-full rounded-2xl p-6 md:p-8 flex flex-col justify-between text-white shadow-2xl border border-white/10 overflow-hidden"
                                        )}
                                        data-directus={setAttr({
                                            collection: "block_step_items",
                                            item: step.id,
                                            fields: ["bg_color"],
                                            mode: "popover",
                                        })}
                                    >
                                        {/* Nội dung */}
                                        <div className="overflow-y-auto">
                                            {stepNumber && (
                                                <span className="block text-5xl font-bold text-white/15 mb-3">
                                                    {stepNumber}
                                                </span>
                                            )}
                                            <h3
                                                className="font-bold text-xl md:text-2xl mb-3 tracking-wide"
                                                data-directus={setAttr({
                                                    collection: "block_step_items",
                                                    item: step.id,
                                                    fields: ["title"],
                                                    mode: "popover",
                                                })}
                                            >
                                                {step.title}
                                            </h3>
                                            {step.content ? (
                                                <div
                                                    className="text-sm md:text-base leading-relaxed text-stone-300 prose-p:my-0 prose-a:text-red-300"
                                                    data-directus={setAttr({
                                                        collection: "block_step_items",
                                                        item: step.id,
                                                        fields: ["content"],
                                                        mode: "drawer",
                                                    })}
                                                    dangerouslySetInnerHTML={{ __html: step.content }}
                                                />
                                            ) : (
                                                <p className="text-sm md:text-base leading-relaxed text-stone-300">
                                                    {DEFAULT_STEPS[index]?.content ?? ""}
                                                </p>
                                            )}

                                            {step.button_group?.buttons?.length ? (
                                                <div className="mt-4">
                                                    <ButtonGroup buttons={step.button_group.buttons} />
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Ảnh minh họa nhỏ góc dưới phải */}
                                        <div className="self-end w-28 h-28 md:w-36 md:h-24 relative rounded-xl overflow-hidden border border-white/20 shadow-md mt-4 shrink-0">
                                            {stepImageId ? (
                                                <DirectusImage
                                                    uuid={stepImageId}
                                                    alt={step.title || ""}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={
                                                        (typeof step.image === "string"
                                                            ? step.image
                                                            : DEFAULT_STEPS[index]?.image ?? "") as string
                                                    }
                                                    alt={step.title || ""}
                                                    className="object-cover w-full h-full absolute inset-0"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Spacer để thoát sticky card cuối */}
                        <div className="h-[40vh]" />
                    </div>

                </div>
            </div>
        </section>
    )
}
