import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export default function ZeroTraceLogo({ className = '', size = 36, withText = false }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ztGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#0052D4" />
          </linearGradient>
        </defs>

        {/* Top Z bar extending to T bar */}
        <path
          d="M 50 55 C 40 55 35 62 35 70 C 35 78 40 85 50 85 L 115 85 L 60 145 C 55 150 55 155 58 160 C 62 165 68 168 75 168 L 130 168 C 140 168 145 160 145 152 C 145 144 140 138 130 138 L 88 138 L 138 82 C 142 77 145 70 145 62 L 145 60 C 145 45 130 35 110 35 L 75 35 C 60 35 50 45 50 55 Z"
          fill="url(#ztGradient)"
          style={{ display: 'none' }} // fallback vector reference
        />

        {/* Clean Vector Path for ZT! Logo */}
        {/* Top Horizontal Z Bar */}
        <path
          d="M 40 55 C 40 45 50 36 62 36 L 125 36 C 140 36 150 46 150 58 C 150 63 148 68 144 73 L 132 88 L 160 88 C 172 88 182 98 182 110 C 182 122 172 132 160 132 L 140 132 C 128 132 118 122 118 110 L 118 100"
          fill="none"
          stroke="url(#ztGradient)"
          strokeWidth="0"
        />

        {/* Z Main Body */}
        <path
          d="M 48 56 C 48 45 58 36 72 36 L 152 36 C 166 36 176 46 176 60 C 176 68 171 76 163 82 L 105 138 L 150 138 C 162 138 172 148 172 160 C 172 172 162 180 150 180 H 70 C 56 180 46 170 46 156 C 46 148 51 140 59 134 L 118 76 H 72 C 58 76 48 67 48 56 Z"
          fill="url(#ztGradient)"
          style={{ display: 'none' }}
        />

        {/* Accurate ZT! Vector Geometry */}
        {/* Main Z Body with Top Right T Curve */}
        <path
          d="M 52 40 C 40 40 32 48 32 60 C 32 72 40 80 52 80 L 106 80 L 46 142 C 38 150 36 160 42 168 C 48 176 58 180 70 180 L 134 180 C 146 180 154 172 154 160 C 154 148 146 140 134 140 L 92 140 L 144 86 C 152 78 156 68 156 56 C 156 46 148 40 136 40 L 174 40 C 186 40 196 48 196 60 C 196 72 186 80 174 80 L 156 80"
          fill="none"
        />

        {/* Official ZT! SVG Path */}
        <g>
          {/* Z Body */}
          <path
            d="M 44 48 C 44 38 52 30 64 30 L 146 30 C 158 30 166 38 166 48 C 166 58 158 66 146 66 L 98 66 L 48 122 C 38 132 36 144 44 154 C 50 162 60 166 72 166 L 138 166 C 150 166 158 158 158 148 C 158 138 150 130 138 130 L 98 130 L 148 74 C 156 65 160 55 160 44 L 180 44 C 192 44 200 52 200 62 C 200 72 192 80 180 80 L 158 80"
            fill="url(#ztGradient)"
            style={{ display: 'none' }}
          />

          {/* Clean stylized ZT! paths */}
          <path
            d="M 45 42 H 145 C 160 42 168 50 168 62 C 168 70 162 78 154 84 L 85 152 H 140 C 152 152 160 160 160 170 C 160 180 152 188 140 188 H 60 C 45 188 38 178 38 166 C 38 156 44 148 52 140 L 122 72 H 60 C 46 72 38 64 38 52 C 38 42 46 42 55 42 Z"
            fill="url(#ztGradient)"
            style={{ display: 'none' }}
          />

          {/* Final Accurate ZT! Render */}
          <path
            d="M 50 40 C 38 40 30 48 30 60 C 30 72 38 80 50 80 L 105 80 L 42 144 C 34 152 34 164 42 172 C 50 180 62 184 74 184 L 134 184 C 146 184 154 176 154 164 C 154 152 146 144 134 144 L 92 144 L 144 90 C 152 82 158 72 158 60 L 176 60 C 188 60 196 68 196 80 C 196 92 188 100 176 100 L 156 100"
            fill="none"
          />

          {/* Simplified Crisp Logo */}
          <path
            d="M 40 40 C 40 30 50 20 65 20 H 135 C 150 20 160 30 160 42 C 160 50 155 58 145 66 L 75 136 H 135 C 150 136 160 146 160 158 C 160 170 150 180 135 180 H 65 C 50 180 40 170 40 158 C 40 150 45 142 55 134 L 125 64 H 65 C 50 64 40 54 40 40 Z"
            fill="url(#ztGradient)"
            style={{ display: 'none' }}
          />

          {/* Precision SVG Path for ZeroTrace ZT! Logo */}
          <path
            d="M 45 35 C 34 35 25 44 25 55 C 25 66 34 75 45 75 H 105 L 42 142 C 34 150 32 162 38 172 C 45 182 58 186 70 186 H 135 C 146 186 155 177 155 166 C 155 155 146 146 135 146 H 92 L 144 92 C 152 84 156 73 156 60 V 55 C 156 44 165 35 176 35 H 180 C 191 35 200 44 200 55 C 200 66 191 75 180 75 H 160"
            fill="none"
          />

          {/* Exact Geometric ZT! Mark */}
          <g>
            <path
              d="M 35 40 H 125 C 140 40 148 48 148 58 C 148 66 142 74 134 82 L 68 152 H 130 C 142 152 150 160 150 170 C 150 180 142 188 130 188 H 50 C 35 188 28 178 28 166 C 28 156 34 148 42 140 L 110 70 H 50 C 36 70 28 62 28 50 C 28 40 36 40 45 40 Z"
              fill="url(#ztGradient)"
              style={{ display: 'none' }}
            />

            {/* THE ACTUAL VISUAL MATCH FOR ZT! LOGO */}
            <path
              d="M 42 32 H 130 C 144 32 152 42 152 54 C 152 64 145 72 135 80 L 72 146 H 135 C 148 146 156 156 156 168 C 156 180 148 188 135 188 H 55 C 40 188 32 178 32 165 C 32 155 38 146 48 136 L 112 70 H 55 C 42 70 32 60 32 48 C 32 38 40 32 48 32 Z"
              fill="url(#ztGradient)"
              style={{ display: 'none' }}
            />

            {/* Z Top horizontal + diagonal + bottom horizontal */}
            <path
              d="M 40 36 H 128 C 145 36 154 48 154 62 C 154 72 146 82 134 92 L 68 156 H 135 C 148 156 156 166 156 178 C 156 190 148 200 135 200 H 50 C 35 200 25 188 25 174 C 25 162 32 150 44 138 L 112 72 H 55 C 40 72 30 60 30 46 C 30 36 40 36 50 36 Z"
              fill="url(#ztGradient)"
              style={{ display: 'none' }}
            />

            {/* Final Clean Hand-Crafted Path for ZT! */}
            {/* Top Bar of Z */}
            <rect x="35" y="32" width="105" height="36" rx="18" fill="url(#ztGradient)" />
            
            {/* Top Right Curve of T */}
            <path d="M 120 32 H 165 C 178 32 188 42 188 55 C 188 68 178 78 165 78 H 155 V 68 V 32 Z" fill="url(#ztGradient)" />

            {/* Diagonal Z Stem */}
            <path d="M 135 55 L 55 145 H 95 L 175 55 Z" fill="url(#ztGradient)" />

            {/* Bottom Bar of Z */}
            <rect x="35" y="132" width="105" height="36" rx="18" fill="url(#ztGradient)" />

            {/* Exclamation Dot ! */}
            <circle cx="168" cy="150" r="18" fill="url(#ztGradient)" />
          </g>
        </g>
      </svg>

      {withText && (
        <span className="font-extrabold tracking-wider text-white text-lg">
          Zero<span className="text-[#147BFF]">Trace</span>
        </span>
      )}
    </div>
  );
}
