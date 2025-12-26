"use client";
import { useUI } from "@/hooks/useUI";
import { Button, Card, InputField, ThemeToggle } from "@/components/ui";
import { useState } from "react";

export default function DesignShowcase() {
  const { isDarkMode } = useUI();
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            VendorVault Design System
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Responsive & Themed Component Showcase
          </p>
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Breakpoint Indicator */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Current Breakpoint
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-brand text-white rounded-lg xs:hidden">
              &lt; xs (480px)
            </span>
            <span className="hidden xs:inline-block sm:hidden px-3 py-1 bg-brand text-white rounded-lg">
              xs (480px+)
            </span>
            <span className="hidden sm:inline-block md:hidden px-3 py-1 bg-brand text-white rounded-lg">
              sm (640px+)
            </span>
            <span className="hidden md:inline-block lg:hidden px-3 py-1 bg-brand text-white rounded-lg">
              md (768px+)
            </span>
            <span className="hidden lg:inline-block xl:hidden px-3 py-1 bg-brand text-white rounded-lg">
              lg (1024px+)
            </span>
            <span className="hidden xl:inline-block 2xl:hidden px-3 py-1 bg-brand text-white rounded-lg">
              xl (1280px+)
            </span>
            <span className="hidden 2xl:inline-block px-3 py-1 bg-brand text-white rounded-lg">
              2xl (1536px+)
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Resize your browser to see the breakpoint change
          </p>
        </Card>

        {/* Color Palette */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <div className="h-20 bg-brand rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Brand
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #3B82F6
              </p>
            </div>
            <div>
              <div className="h-20 bg-success rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Success
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #22C55E
              </p>
            </div>
            <div>
              <div className="h-20 bg-warning rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Warning
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #F59E0B
              </p>
            </div>
            <div>
              <div className="h-20 bg-error rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Error
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #EF4444
              </p>
            </div>
            <div>
              <div className="h-20 bg-info rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Info
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #0EA5E9
              </p>
            </div>
          </div>
        </Card>

        {/* Typography */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Typography Scale
          </h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                Heading 1
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                text-4xl sm:text-5xl md:text-6xl
              </p>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Heading 2
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                text-3xl sm:text-4xl md:text-5xl
              </p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Heading 3
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                text-2xl sm:text-3xl md:text-4xl
              </p>
            </div>
            <div>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300">
                Body text - Lorem ipsum dolor sit amet, consectetur adipiscing
                elit.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                text-base sm:text-lg md:text-xl
              </p>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Button Variants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Primary
              </p>
              <Button variant="primary" fullWidth>
                Primary Button
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Secondary
              </p>
              <Button variant="secondary" fullWidth>
                Secondary Button
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Success
              </p>
              <Button variant="success" fullWidth>
                Success Button
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Danger
              </p>
              <Button variant="danger" fullWidth>
                Danger Button
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Outline
              </p>
              <Button variant="outline" fullWidth>
                Outline Button
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Disabled
              </p>
              <Button variant="primary" fullWidth disabled>
                Disabled Button
              </Button>
            </div>
          </div>

          <h3 className="text-lg font-bold mt-8 mb-4 text-gray-900 dark:text-white">
            Button Sizes
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </Card>

        {/* Form Inputs */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Form Inputs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Normal Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <InputField
              label="Required Input"
              placeholder="This field is required"
              required
            />
            <InputField
              label="Error State"
              placeholder="Input with error"
              error="This field has an error"
              value={inputError}
              onChange={(e) => setInputError(e.target.value)}
            />
            <InputField
              label="Disabled Input"
              placeholder="Disabled input"
              disabled
            />
          </div>
        </Card>

        {/* Responsive Grid */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Responsive Grid
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            1 column on mobile, 2 on tablet, 3 on desktop
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center"
              >
                <div className="text-2xl font-bold">Card {num}</div>
                <div className="text-sm opacity-80 mt-2">
                  Responsive grid item
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Spacing Scale */}
        <Card className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Spacing Scale
          </h2>
          <div className="space-y-4">
            {[
              { size: "1", px: "4px" },
              { size: "2", px: "8px" },
              { size: "4", px: "16px" },
              { size: "6", px: "24px" },
              { size: "8", px: "32px" },
              { size: "12", px: "48px" },
              { size: "16", px: "64px" },
            ].map((spacing) => (
              <div key={spacing.size}>
                <div className="flex items-center gap-4">
                  <div
                    className={`bg-brand h-8 rounded`}
                    style={{ width: spacing.px }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {spacing.size} ({spacing.px})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            VendorVault Design System • Built with TailwindCSS • Responsive &
            Accessible
          </p>
        </div>
      </div>
    </main>
  );
}
