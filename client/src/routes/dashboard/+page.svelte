<script>
  import { onMount } from 'svelte';
  import { ChevronDown, ChevronUp, Search, Bell, BarChart2, CheckCircle, Clock, GraduationCap, Menu, X, LogOut, Minus, Crown } from 'lucide-svelte';
  
  let username = "Dzikra N";
  let role = "Superadmin";
  let greeting = "Hi, Dzikra N,";
  let welcomeMessage = "Selamat datang di TwoTend";
  let sidebarOpen = false;
  
  // Toggle sidebar on mobile
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  // Close sidebar when clicking outside on mobile
  function handleClickOutside(event) {
    if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
      sidebarOpen = false;
    }
  }
  
  // Stats data
  const stats = [
    { 
      id: 1, 
      value: "1,197", 
      change: "65%", 
      trend: "up", 
      color: "green",
      chartColor: `var(--color-green)`
    },
    { 
      id: 2, 
      value: "20", 
      change: "12%", 
      trend: "down", 
      color: "brown",
      chartColor: `var(--color-brown)`
    },
    { 
      id: 3, 
      value: "1,217", 
      change: "3.5%", 
      trend: "up", 
      color: "purple",
      chartColor: `var(--color-purple)`
    }
  ];
  
  // Info cards data
  const infoCards = [
    {
      id: 1,
      title: "Kehadiran tepat",
      subtitle: "Pembaruan pada 7 mar",
      icon: CheckCircle,
      bgColor: "bg-green"
    },
    {
      id: 2,
      title: "Terlambat",
      subtitle: "Pembaruan pada 7 mar",
      icon: Clock,
      bgColor: "bg-brown"
    },
    {
      id: 3,
      title: "Total Siswa",
      subtitle: "Pembaruan pada 20 Jul",
      icon: GraduationCap,
      bgColor: "bg-purple"
    }
  ];
  
  // Sidebar items
  const sidebarItems = [
    { id: 1, label: "Dashboard", icon: "grid", active: true },
    { id: 2, label: "Rekap", icon: "bar-chart-2", hasSubmenu: true, expanded: true, 
      submenu: [
        { id: 21, label: "Siswa" },
        { id: 22, label: "Guru" },
        { id: 23, label: "Staff" }
      ] 
    },
    { id: 3, label: "Data", icon: "database", hasSubmenu: true },
    { id: 4, label: "Formulir", icon: "file-text" },
    { id: 5, label: "Settings", icon: "settings" }
  ];

  const Leaderboards = [
    { id: 1, icon:"Z", color:"purple", name: "Zikri AF", class: "XII RPL 2", score: -10 },
    { id: 2, icon:"V", color:"green", name: "Virgi AF", class: "XII RPL 2", score: 37 },
    { id: 3, icon:"D", color:"amber-900", name: "Dzikra AF", class: "XII RPL 2", score: 29 },
    { id: 4, icon:"H", color:"brown", name: "Harvi AF", class: "XII RPL 1", score: 46 },
    { id: 5, icon:"A", color:"yellow", name: "Akhtar AF", class: "XII RPL 1", score: 89 },
    { id: 6, icon:"A", color:"purple", name: "Akbar AF", class: "X TKJ", score: 73 },
  ]
  
  // Generate simple chart data
  function generateChartData(trend, points = 10) {
    const data = [];
    let value = 50;
    
    for (let i = 0; i < points; i++) {
      if (trend === 'up') {
        value += Math.random() * 10 - 3;
      } else {
        value -= Math.random() * 10 - 3;
      }
      value = Math.max(10, Math.min(90, value));
      data.push(value);
    }
    
    return data;
  }
  
  // Create SVG path from data points
  function createSvgPath(data, width, height) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const xStep = width / (data.length - 1);
    const points = data.map((value, index) => {
      const x = index * xStep;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  }
  
  // Generate chart paths for each stat
  $: chartPaths = stats.map(stat => {
    const data = generateChartData(stat.trend);
    return createSvgPath(data, 100, 40);
  });
  
  let selectedTab = "Overview";
  let dateRange = "3 Feb - Now";
  
  // Handle window resize
  let windowWidth;
  
  onMount(() => {
    const handleResize = () => {
      windowWidth = window.innerWidth;
      if (windowWidth >= 1024) {
        sidebarOpen = true;
      } else {
        sidebarOpen = false;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<svelte:window on:click={handleClickOutside}/>

<div class="flex flex-col h-screen bg-primary text-white overflow-hidden">
  <!-- Mobile Header -->
  <header class="lg:hidden flex items-center justify-between p-4">
    <div class="flex items-center">
      <button class="sidebar-toggle mr-3" on:click={toggleSidebar}>
        <Menu size={24} />
      </button>
      <div class="flex items-center">
        <div class="h-6 w-6 bg-gray-300 mr-2"></div>
        <span class="text-xl font-semibold">TwoTend</span>
      </div>
    </div>
    
    <!-- Notification & User info -->
    <div class="flex items-center space-x-3">
      <button class="p-1.5 rounded-xl bg-secondary">
        <Bell  size={20} />
      </button>
      <div class="h-8 w-8 rounded-xl pb-0.5 bg-amber-900 flex items-center justify-center text-white font-semibold">
        D
      </div>
    </div>
  </header>
  
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar - hidden on mobile by default, shown when sidebarOpen is true -->
    <div 
      class={`sidebar fixed inset-0 z-40 lg:relative lg:z-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div class="flex flex-col h-full w-64 bg-secondary">
        <!-- Sidebar Header with close button on mobile -->
        <div class="p-4 flex items-center justify-between lg:justify-start lg:border-none">
          <div class="flex items-center">
            <div class="h-6 w-6 bg-gray-300 mr-2"></div>
            <span class="text-xl font-semibold">TwoTend</span>
          </div>
          <button class="lg:hidden p-1" on:click={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <!-- User info -->
        <div class="p-4 flex items-center">
          <div class="h-10 w-10 pb-0.5 rounded-xl bg-amber-900 flex items-center justify-center text-white font-semibold">
            D
          </div>
          <div class="ml-3">
            <div class="font-medium">{username}</div>
            <div class="text-sm text-gray-400">{role}</div>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 pt-2 overflow-y-auto">
          <ul>
            {#each sidebarItems as item}
              <li>
                <a 
                  href="#{item.label.toLowerCase()}" 
                  class="flex items-center px-4 py-3 m-4 rounded-xl {item.active ? 'bg-purple text-white' : 'text-gray-300 hover:bg-box'}"
                >
                  <span class="w-6 h-6 flex items-center justify-center mr-3">
                    {#if item.icon === "grid"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    {:else if item.icon === "bar-chart-2"}
                      <BarChart2 size={20} />
                    {:else if item.icon === "database"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    {:else if item.icon === "file-text"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                    {:else if item.icon === "settings"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    {/if}
                  </span>
                  <span>{item.label}</span>
                  {#if item.hasSubmenu}
                    <ChevronDown size={16} class="ml-auto" />
                  {/if}
                </a>
                
                {#if item.hasSubmenu && item.expanded}
                  <ul class="pl-12 py-1 bg-secondary">
                    {#if item.submenu}
                      {#each item.submenu as subitem}
                        <li>
                          <a 
                            href="#{subitem.label.toLowerCase()}" 
                            class="block py-2 text-gray-400 hover:text-white"
                          >
                            {subitem.label}
                          </a>
                        </li>
                      {/each}
                    {/if}
                  </ul>
                {/if}
              </li>
            {/each}
          </ul>
        </nav>
        
        <!-- Logout -->
        <div class="p-4 mb-4">
          <a href="#logout" class="ml-2 flex items-center text-red hover:text-red-900">
            <LogOut size={20} class="mr-2" />
            <span>Logout</span>
          </a>
        </div>
      </div>
      
      <!-- Semi-transparent overlay on mobile -->
      <button 
        type="button"
        class="lg:hidden fixed inset-0 bg-black/50 -z-10"
        on:click={toggleSidebar}
        on:keydown={(event) => event.key === 'Enter' && toggleSidebar()}
        aria-label="Close sidebar"
      ></button>
    </div>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Desktop Header -->
      <header class="hidden lg:flex h-16 items-center justify-between px-6">
        <h1 class="text-2xl font-semibold">Dashboard</h1>
        
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search here..." 
              class="bg-secondary text-white rounded-md py-2 pl-3 w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            <Search size={18} class="absolute right-3 top-2.5 text-white" />
          </div>
          
          <!-- Notifications -->
          <button class="p-2 rounded-xl bg-secondary">
            <Bell size={20} />
          </button>
          
          <!-- Profile -->
          <div class="h-9 w-9 pb-0.5 rounded-xl bg-amber-900 flex items-center justify-center text-white font-semibold">
            D
          </div>
        </div>
      </header>
      
      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <!-- Dashboard title on mobile -->
        <div class="lg:hidden mb-4">
          <h1 class="text-xl font-semibold">Dashboard</h1>
        </div>
        
        <!-- Search on mobile -->
        <div class="lg:hidden relative mb-6">
          <input 
            type="text" 
            placeholder="Search here..." 
            class="bg-secondary text-white rounded-md py-2 pl-3 w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <Search size={18} class="absolute right-3 top-2.5 text-white" />
        </div>
        
        <!-- Welcome message -->
        <div class="mb-6 md:mb-8">
          <h2 class="text-2xl md:text-3xl font-semibold">{greeting}</h2>
          <p class="text-2xl md:text-3xl font-semibold">{welcomeMessage}</p>
        </div>
        
        <!-- Tabs and filters -->
        <div class="flex flex-col md:flex-row md:justify-between mb-6 space-y-4 md:space-y-0">
          <div class="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 md:pb-0">
            <button 
              class={`px-3 md:px-4 py-1 rounded-lg whitespace-nowrap ${selectedTab === 'Overview' ? 'bg-box' : 'bg-secondary hover:bg-box'}`}
              on:click={() => selectedTab = 'Overview'}
            >
              Overview
            </button>
            <button 
              class={`px-3 md:px-4 py-1 rounded-lg whitespace-nowrap ${selectedTab === 'Stats' ? 'bg-box' : 'bg-secondary hover:bg-box'}`}
              on:click={() => selectedTab = 'Stats'}
            >
              Stats
            </button>
            <button 
              class={`px-3 md:px-4 py-1 rounded-lg whitespace-nowrap ${selectedTab === 'Update' ? 'bg-box' : 'bg-secondary hover:bg-box'}`}
              on:click={() => selectedTab = 'Update'}
            >
              Update
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <button class="flex items-center bg-secondary px-3 py-1 rounded-lg text-sm md:text-base">
              <span>{dateRange}</span>
              <ChevronDown size={16} class="ml-2" />
            </button>
            
            <button class="flex items-center bg-secondary px-3 py-1 rounded-lg text-sm md:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <!-- Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
          {#each stats as stat, i}
            <div class="bg-secondary rounded-3xl p-4 overflow-hidden">
              <!-- Chart cards -->
              <div class="bg-box rounded-xl flex justify-between">
                <!-- Mini chart -->
                 <div class="flex items-center w-full">
                   <svg width="100%" height="50%" viewBox="0 0 100 40" preserveAspectRatio="none">
                     <path
                     d={chartPaths[i]}
                     fill="none"
                     stroke={stat.chartColor}
                     stroke-width="2"
                     vector-effect="non-scaling-stroke"
                     />
                   </svg>
                 </div>

                <!-- Data Chart -->
                <div class="bg-card rounded-xl flex flex-col justify-center px-4 py-7">
                  <div class="text-3xl text-center md:text-4xl md:mb-1 font-bold">{stat.value}</div>
                  <div class="px-2 py-1 rounded text-sm md:text-sm flex items-center text-white">
                    {#if stat.trend === 'up'}
                      <ChevronUp size={20} strokeWidth={3} class="mr-1 p-0.5 bg-green rounded-xl" />
                      <div class="text-sm bg-green px-3 rounded-xl">
                        {stat.change}
                      </div>
                    {:else}
                      <ChevronDown size={20} strokeWidth={3} class="mr-1 p-0.5 bg-brown rounded-xl" />
                      <div class="text-sm bg-brown px-3 rounded-xl">
                        {stat.change}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              <!-- Info cards -->
              <div class="bg-box mt-2 flex items-center rounded-full p-2">
                <div class={`w-10 h-10 md:w-12 md:h-12 rounded-full ${infoCards[i].bgColor} flex items-center justify-center mr-4 flex-shrink-0`}>
                  <svelte:component this={infoCards[i].icon} size={20} />
                </div>
                <div class="min-w-0">
                  <div class="font-medium truncate">{infoCards[i].title}</div>
                  <div class="text-xs md:text-sm text-gray-400 truncate">{infoCards[i].subtitle}</div>
                </div>
              </div>
            </div>
          {/each}
          <div class="bg-secondary rounded-3xl p-4 overflow-hidden">
            <!-- Live data -->
            <div class="bg-box rounded-xl flex justify-between">
              <div class="flex flex-col m-3 w-full">
                <div class="flex items-center gap-2">
                  <div class="p-1 rounded-full bg-brown"></div>
                  <p class="text-md font-medium">Live Data</p>
                </div>
                <h2 class="text-3xl font-bold m-auto">937</h2>
              </div>
              <div class="bg-card rounded-xl flex flex-col items-center px-7 py-7">
                <h2 class="text-3xl font-semibold">6:20</h2>
                <h2 class="text-3xl font-semibold">PM</h2>
              </div>
            </div>
            <!-- persentase kehadiran -->
             <div class="flex justify-center items-center gap-2 mt-6">
               <div class="font-semibold bg-yellow p-1 rounded-full">
                 <Minus size={25} strokeWidth={3} />
               </div>
               <div class="text-2xl font-semibold bg-yellow pb-0.5 px-8 rounded-full">
                 9%
               </div>
             </div>
          </div>
        </div>
        
        <!-- Monthly stats -->
         <div class="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6 mb-5">
           <div class="bg-secondary rounded-3xl p-4 xl:col-span-3">
             <div class="bg-box rounded-2xl px-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
               <div class="flex items-center">
                 <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple flex items-center justify-center mr-4 flex-shrink-0">
                   <BarChart2 size={20} />
                 </div>
                 <div>
                   <div class="font-medium">Rata - Rata Bulanan</div>
                   <div class="text-xs md:text-sm text-gray-400">Lorem ipsum dolor sit amet</div>
                 </div>
               </div>
               
               <button class="flex items-center bg-card px-3 py-1.5 rounded-md self-start sm:self-auto">
                 <span>Bulanan</span>
                 <ChevronDown size={16} class="ml-2" />
               </button>
             </div>
             
             <!-- Placeholder for chart -->
             <div class="h-48 md:h-64 rounded-lg flex items-center justify-center"></div>
           </div>
           <div class="bg-secondary rounded-3xl p-4">
            <div class="bg-box flex items-center rounded-full p-2">
              <div class={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple flex items-center justify-center mr-4 flex-shrink-0`}>
                <Crown size={20} />
              </div>
              <div class="font-medium truncate">Leaderboards</div>
            </div>
            {#each Leaderboards as leaderboard, i}
            <div class="mt-4 flex items-center">
              <div class="h-10 w-10 rounded-xl pb-0.5 bg-{leaderboard.color} flex items-center justify-center text-white font-semibold">
                {leaderboard.icon}
              </div>
              <div class="min-w-0 ml-3">
                <div class="font-medium truncate">{leaderboard.name}</div>
                <div class="text-xs md:text-sm text-gray-400 truncate">{leaderboard.class}</div>
              </div>
              <div class="ml-auto mr-1 font-medium">
                <span class="text-md">{leaderboard.score}</span>
              </div>
            </div>
            {/each}
           </div>
         </div>
      </main>
    </div>
  </div>
</div>