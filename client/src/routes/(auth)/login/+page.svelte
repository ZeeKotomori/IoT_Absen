<script>
  import { onMount } from 'svelte';
  import { Eye, EyeOff } from 'lucide-svelte';
  
  let username = '';
  let password = '';
  let showPassword = false;
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
  
  function handleSubmit() {
    // Handle login logic here
    console.log('Login attempt with:', { username, password });
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-primary">
  <div class="w-full max-w-md px-6">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold text-white mb-2">Hello There!</h1>
      <h2 class="text-4xl font-bold text-white">Welcome back</h2>
    </div>
    
    <div class="bg-box rounded-lg p-8 border border-purple">
      <h3 class="text-lg font-medium text-white text-center mb-6">Login Here</h3>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-4">
          <label for="username" class="block text-white mb-2">Username</label>
          <input 
            type="text" 
            id="username" 
            placeholder="Masukan username"
            bind:value={username} 
            class="w-full px-4 py-2 rounded-xl bg-secondary text-white border-none ring-1 focus-visible:outline-1 ring-card focus-visible:outline-purple"
          />
        </div>
        
        <div class="mb-8">
          <label for="password" class="block text-white mb-2">Password</label>
          <div class="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              placeholder="Masukan password"
              bind:value={password} 
              class="w-full px-4 py-2 rounded-xl bg-secondary text-white border-none ring-1 focus-visible:outline-1 ring-card focus-visible:outline-purple"
            />
            <button 
              type="button" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
              on:click={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <Eye size={20} />
              {:else}
                <EyeOff size={20} />
              {/if}
            </button>
          </div>
        </div>
        <div class="mx-auto w-1/3">
          <button 
            type="submit" 
            class="w-full cursor-pointer bg-purple hover:bg-[#3f49a0] text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</div>