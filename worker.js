addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/') {
    // 主页，提供 HTML 界面
    return new Response(htmlTemplate, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  } else if (path === '/save' && request.method === 'POST') {
    // 保存剪贴板内容
    const { key, content } = await request.json();
    if (!key || !content) {
      return new Response('参数不完整', { status: 400 });
    }
    
    // 存储内容
    await JTB.put(key, content);
    return new Response('保存成功');
    
  } else if (path.startsWith('/read/') && request.method === 'GET') {
    // 读取剪贴板内容
    const key = path.substring(6); // 去掉 '/read/' 前缀
    
    const content = await JTB.get(key);
    if (!content) {
      return new Response('内容不存在', { status: 404 });
    }
    
    return new Response(content);
    
  } else if (path.startsWith('/delete/') && request.method === 'DELETE') {
    // 删除剪贴板内容
    const key = path.substring(8); // 去掉 '/delete/' 前缀
    
    const content = await JTB.get(key);
    if (!content) {
      return new Response('内容不存在', { status: 404 });
    }
    
    await JTB.delete(key);
    return new Response('删除成功');
    
  } else if (path === '/manifest.json') {
    return new Response(manifestContent, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 其他路径返回 404
  return new Response('未找到', { status: 404 });
}

const manifestContent = `{
  "name": "在线剪贴板",
  "short_name": "剪贴板",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f4f4f4",
  "theme_color": "#007bff",
  "icons": [
    {
      "src": "https://img.xwyue.com/i/2025/01/06/677b63d2572db.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://img.xwyue.com/i/2025/01/06/677b63d2572db.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`;

const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <title>在线剪贴板</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="https://img.xwyue.com/i/2025/01/06/677b63d2572db.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="在线剪贴板">
  <link rel="apple-touch-icon" href="https://img.xwyue.com/i/2025/01/06/677b63d2572db.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '#2980b9',
            secondary: '#3498db',
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'pulse-slow': 'pulse 3s infinite'
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' }
            },
            slideUp: {
              '0%': { transform: 'translateY(20px)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' }
            }
          }
        }
      }
    };
  </script>
  <style>
    /* 自定义滚动条 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.2);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.3);
    }
    .dark ::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
    }
    .dark ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
    }
    .dark ::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
  <!-- 背景装饰 -->
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute -inset-[10px] opacity-50">
      <div class="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div class="absolute top-2/3 left-1/2 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>
      <div class="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-2000"></div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-8 relative">
    <div class="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 animate-fade-in">
      <h1 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center mb-8 animate-slide-up">在线剪贴板</h1>
      
      <!-- 页面切换按钮 -->
      <div class="flex justify-center mb-8">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button id="createTab" class="px-6 py-2 rounded-md bg-blue-600 text-white font-medium transition-all">生成内容</button>
          <button id="readTab" class="px-6 py-2 rounded-md text-gray-600 dark:text-gray-300 font-medium transition-all">读取内容</button>
        </div>
      </div>
      
      <!-- 生成内容页面 -->
      <div id="createPage" class="space-y-6">
        <div class="relative group">
          <input 
            type="text" 
            id="clipboardKey" 
            placeholder="输入唯一标识符" 
            class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          >
          <div class="absolute bottom-[-20px] left-0 text-xs text-gray-500 dark:text-gray-400">
            用于检索内容的唯一标识符
          </div>
        </div>
        
        <div class="relative group">
          <textarea 
            id="clipboard" 
            placeholder="在此处输入要保存的内容..." 
            class="w-full h-64 p-4 rounded-xl border-2 border-slate-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-all duration-300 backdrop-blur-sm group-hover:border-blue-300 dark:group-hover:border-blue-500"
          ></textarea>
          <div class="absolute bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <i class="fas fa-edit mr-1"></i>点击编辑
          </div>
        </div>

        <div class="flex flex-wrap gap-4 justify-center">
          <button id="saveBtn" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 dark:shadow-blue-800/30 transform hover:scale-105 active:scale-95 transition-all duration-200">
            <i class="fas fa-cloud-upload-alt text-lg"></i>
            <span>保存到云端</span>
          </button>
          <button id="copyBtn" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 dark:from-green-700 dark:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/20 dark:shadow-green-800/30 transform hover:scale-105 active:scale-95 transition-all duration-200">
            <i class="fas fa-copy text-lg"></i>
            <span>复制到本地</span>
          </button>
        </div>
      </div>

      <!-- 读取内容页面 -->
      <div id="readPage" class="space-y-6 hidden">
        <div class="relative group">
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input 
                type="text" 
                id="readKey" 
                placeholder="输入要读取的内容标识符" 
                class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              >
              <div class="absolute bottom-[-20px] left-0 text-xs text-gray-500 dark:text-gray-400">
                输入之前保存时使用的标识符
              </div>
            </div>
            <button id="readBtn" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 dark:from-purple-700 dark:to-purple-800 dark:hover:from-purple-600 dark:hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20 dark:shadow-purple-800/30 transform hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap">
              <i class="fas fa-cloud-download-alt text-lg"></i>
              <span>读取</span>
            </button>
          </div>
        </div>
        
        <div class="relative group">
          <textarea 
            id="readContent" 
            placeholder="读取的内容将显示在这里..." 
            class="w-full h-64 p-4 rounded-xl border-2 border-slate-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-all duration-300 backdrop-blur-sm group-hover:border-blue-300 dark:group-hover:border-blue-500"
            readonly
          ></textarea>
        </div>

        <div class="flex flex-wrap gap-4 justify-center">
          <button id="deleteBtn" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 dark:from-red-700 dark:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white font-semibold shadow-lg shadow-red-500/20 dark:shadow-red-800/30 transform hover:scale-105 active:scale-95 transition-all duration-200">
            <i class="fas fa-trash-alt text-lg"></i>
            <span>删除内容</span>
          </button>
          <button id="copyReadBtn" class="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 dark:from-green-700 dark:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/20 dark:shadow-green-800/30 transform hover:scale-105 active:scale-95 transition-all duration-200">
            <i class="fas fa-copy text-lg"></i>
            <span>复制到本地</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 自定义 Toast 提示 -->
  <div id="customToast" class="fixed top-4 right-4 z-50 transform translate-x-full transition-transform duration-300">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-64">
      <div class="flex items-center gap-3">
        <div id="toastIcon" class="w-6 h-6 rounded-full flex items-center justify-center">
          <i id="toastIconClass" class="text-sm"></i>
        </div>
        <div class="flex-1">
          <p id="toastMessage" class="text-sm font-medium text-gray-800 dark:text-gray-200"></p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const clipboardTextarea = document.getElementById('clipboard');
    const clipboardKey = document.getElementById('clipboardKey');
    const readKey = document.getElementById('readKey');
    const readContent = document.getElementById('readContent');
    const saveBtn = document.getElementById('saveBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const readBtn = document.getElementById('readBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyReadBtn = document.getElementById('copyReadBtn');
    const createTab = document.getElementById('createTab');
    const readTab = document.getElementById('readTab');
    const createPage = document.getElementById('createPage');
    const readPage = document.getElementById('readPage');
    const customToast = document.getElementById('customToast');
    const toastIcon = document.getElementById('toastIcon');
    const toastIconClass = document.getElementById('toastIconClass');
    const toastMessage = document.getElementById('toastMessage');

    // 自定义 Toast 提示函数
    function showToast(message, type = 'info') {
      const config = {
        success: {
          icon: 'fas fa-check',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-600 dark:text-green-400'
        },
        error: {
          icon: 'fas fa-exclamation-triangle',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-600 dark:text-red-400'
        },
        info: {
          icon: 'fas fa-info-circle',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-600 dark:text-blue-400'
        }
      };

      const style = config[type];
      toastIcon.className = \`w-6 h-6 rounded-full flex items-center justify-center \${style.bgColor}\`;
      toastIconClass.className = \`\${style.icon} \${style.textColor} text-sm\`;
      toastMessage.textContent = message;

      // 显示 toast
      customToast.style.transform = 'translateX(0)';
      
      // 3秒后自动隐藏
      setTimeout(() => {
        customToast.style.transform = 'translateX(full)';
      }, 3000);
    }

    // 自动检测暗黑模式
    function checkDarkMode() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
    checkDarkMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkDarkMode);

    // 页面切换功能
    function switchToCreate() {
      createTab.classList.add('bg-blue-600', 'text-white');
      createTab.classList.remove('text-gray-600', 'dark:text-gray-300');
      readTab.classList.remove('bg-blue-600', 'text-white');
      readTab.classList.add('text-gray-600', 'dark:text-gray-300');
      createPage.classList.remove('hidden');
      readPage.classList.add('hidden');
    }

    function switchToRead() {
      readTab.classList.add('bg-blue-600', 'text-white');
      readTab.classList.remove('text-gray-600', 'dark:text-gray-300');
      createTab.classList.remove('bg-blue-600', 'text-white');
      createTab.classList.add('text-gray-600', 'dark:text-gray-300');
      readPage.classList.remove('hidden');
      createPage.classList.add('hidden');
    }

    createTab.addEventListener('click', switchToCreate);
    readTab.addEventListener('click', switchToRead);

    // 回车键触发读取功能
    readKey.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        readBtn.click();
      }
    });

    saveBtn.addEventListener('click', async () => {
      const key = clipboardKey.value.trim();
      const content = clipboardTextarea.value.trim();
      
      if (!key || !content) {
        showToast('请填写完整的标识符和内容！', 'info');
        return;
      }

      saveBtn.classList.add('opacity-60', 'pointer-events-none');
      
      try {
        const response = await fetch('/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key, content })
        });

        if (response.ok) {
          showToast('已保存到云端！', 'success');
          // 保存成功后不清空内容，方便用户继续编辑
        } else {
          const error = await response.text();
          showToast('保存失败：' + error, 'error');
        }
      } catch (error) {
        showToast('保存失败：' + error.message, 'error');
      } finally {
        saveBtn.classList.remove('opacity-60', 'pointer-events-none');
      }
    });

    deleteBtn.addEventListener('click', async () => {
      const key = readKey.value.trim();
      
      if (!key) {
        showToast('请输入要删除的内容标识符！', 'info');
        return;
      }

      deleteBtn.classList.add('opacity-60', 'pointer-events-none');
      
      try {
        const response = await fetch(\`/delete/\${key}\`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showToast('内容已删除！', 'success');
          readKey.value = '';
          readContent.value = '';
        } else {
          const error = await response.text();
          showToast('删除失败：' + error, 'error');
        }
      } catch (error) {
        showToast('删除失败：' + error.message, 'error');
      } finally {
        deleteBtn.classList.remove('opacity-60', 'pointer-events-none');
      }
    });

    readBtn.addEventListener('click', async () => {
      const key = readKey.value.trim();
      if (!key) {
        showToast('请输入标识符！', 'info');
        return;
      }

      readBtn.classList.add('opacity-60', 'pointer-events-none');
      
      try {
        const response = await fetch(\`/read/\${key}\`);
        if (response.ok) {
          const content = await response.text();
          readContent.value = content;
          showToast('内容读取成功！', 'success');
        } else {
          const error = await response.text();
          showToast('读取失败：' + error, 'error');
          readContent.value = '';
        }
      } catch (error) {
        showToast('读取失败：' + error.message, 'error');
        readContent.value = '';
      } finally {
        readBtn.classList.remove('opacity-60', 'pointer-events-none');
      }
    });

    copyBtn.addEventListener('click', () => {
      clipboardTextarea.select();
      document.execCommand('copy');
      showToast('已复制到本地剪贴板！', 'success');
    });

    copyReadBtn.addEventListener('click', () => {
      readContent.select();
      document.execCommand('copy');
      showToast('已复制到本地剪贴板！', 'success');
    });
  </script>
</body>
</html>
`;
