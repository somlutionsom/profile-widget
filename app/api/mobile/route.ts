import { NextResponse } from 'next/server';

export async function GET() {
  // Return minimal HTML for mobile iframe
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, system-ui, sans-serif;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .card {
          width: 340px;
          height: 450px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .banner {
          height: 160px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 4px solid white;
          position: absolute;
          top: 105px;
          left: 50%;
          transform: translateX(-50%);
          background: #e0e0e0;
        }
        .content {
          margin-top: 60px;
          text-align: center;
          padding: 20px;
        }
        .name {
          font-size: 23px;
          font-weight: bold;
          color: #484747;
          margin-bottom: 20px;
        }
        .btn {
          padding: 8px 20px;
          border-radius: 20px;
          border: none;
          background: #FFD0D8;
          color: white;
          font-size: 14px;
          margin: 10px;
        }
        .text {
          color: #666;
          margin: 10px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="banner"></div>
        <div class="avatar"></div>
        <div class="content">
          <div class="name">♡⸝⸝</div>
          <button class="btn">Button</button>
          <div class="text">문구를 입력해 주세요 ♡</div>
          <div class="text">문구를 입력해 주세요 ♡</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': 'frame-ancestors *;',
    },
  });
}
