
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "shadow-sm hover:shadow-md active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          "shadow-sm hover:shadow-md active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        outline: [
          "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
          "hover:border-accent hover:shadow-sm active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        secondary: [
          "bg-secondary/80 text-secondary-foreground backdrop-blur-sm hover:bg-secondary/90",
          "shadow-sm hover:shadow-md active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        ghost: [
          "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",
          "active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
        link: [
          "text-primary underline-offset-4 hover:underline",
          "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:ease-in-out after:bg-primary",
        ].join(" "),
        gradient: [
          "bg-gradient-to-r from-[#FF7940] to-[#FF5B14] text-white",
          "border border-white/10 hover:border-white/20 shadow-md hover:shadow-lg shadow-orange/20 active:translate-y-0.5 active:shadow-inner",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
          "animate-breathe"
        ].join(" "),
        glass: [
          "bg-white/15 backdrop-blur-md text-white border border-white/20",
          "hover:bg-white/20 hover:border-white/30 hover:shadow-lg active:shadow-inner active:translate-y-0.5",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean,
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Handle ripple effect
    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return;
      
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);
      
      // Position relative to click within button
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
      
      // Style the ripple
      circle.style.position = "absolute";
      circle.style.borderRadius = "50%";
      circle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      circle.style.transform = "scale(0)";
      circle.style.animation = "ripple 0.6s linear forwards";
      circle.style.pointerEvents = "none";
      
      // Remove previous ripples
      const ripples = button.getElementsByClassName("ripple");
      for (let i = 0; i < ripples.length; i++) {
        button.removeChild(ripples[i]);
      }
      
      circle.classList.add("ripple");
      button.appendChild(circle);
      
      // Clean up after animation
      setTimeout(() => {
        if (circle.parentElement === button) {
          button.removeChild(circle);
        }
      }, 600);
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={(e) => {
          createRipple(e);
          props.onClick?.(e);
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
