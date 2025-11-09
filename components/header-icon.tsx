import { Button } from "@/components/ui/button"
import Link from "next/link";
import {useState} from "react";

type HeaderIconProps = {
    icon: any
    mobile: boolean,
    label: string
    href?: string
    onClick?: () => void
}

export function HeaderIcon({ icon: Icon, href, onClick, label, mobile }: HeaderIconProps) {
    const [showLabel, setShowLabel] = useState(false)

    const IconClassName = "h-4 w-4"
    const ButtonVariant = "ghost"
    const ButtonSize = mobile ? "sm" : "icon-sm"

    const baseClasses =
        "flex items-center justify-center transition-all duration-200 ease-in-out whitespace-nowrap"
    const ButtonClassName = mobile
        ? `${baseClasses} w-full`
        : `${baseClasses} rounded-lg px-2`

    const icon = (
        <>
            <span className="flex items-center justify-center w-2 shrink-0">
                <Icon className={IconClassName} />
            </span>
            {mobile && <span className=" text-sm ml-4">{label}</span>}
            {!mobile && (
                <span
                    className={`overflow-hidden text-sm transition-all duration-200 ease-in-out ${
                        showLabel ? "opacity-100 ml-2 max-w-[120px]" : "opacity-0 ml-0 max-w-0"
                    }`}
                >
                    {label}
                </span>
            )}
        </>
    )

    const content = href ? <Link href={href} className="flex items-center justify-center" >{icon}</Link> : icon

    return (
        <Button
            variant={ButtonVariant}
            size={ButtonSize}
            onClick={onClick}
            className={`${ButtonClassName} ${
                !mobile
                    ? showLabel
                        ? "w-[160px]" // expanded width
                        : "w-[35px]"  // slightly wider collapsed size to prevent clip
                    : ""
            }`}
            onMouseEnter={() => !mobile && setShowLabel(true)}
            onMouseLeave={() => !mobile && setShowLabel(false)}
        >
            {content}
        </Button>
    )
}
