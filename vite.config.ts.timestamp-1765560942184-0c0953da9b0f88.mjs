// vite.config.ts
import { sveltekit } from "file:///home/project/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.config.*",
        "**/*.spec.ts",
        "**/*.test.ts"
      ]
    },
    setupFiles: ["./src/lib/test/setup.ts"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdHRlc3Q6IHtcblx0XHRpbmNsdWRlOiBbJ3NyYy8qKi8qLnt0ZXN0LHNwZWN9Lntqcyx0c30nXSxcblx0XHRlbnZpcm9ubWVudDogJ2pzZG9tJyxcblx0XHRnbG9iYWxzOiB0cnVlLFxuXHRcdGNvdmVyYWdlOiB7XG5cdFx0XHRwcm92aWRlcjogJ3Y4Jyxcblx0XHRcdHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbicsICdodG1sJ10sXG5cdFx0XHRleGNsdWRlOiBbXG5cdFx0XHRcdCdub2RlX21vZHVsZXMvJyxcblx0XHRcdFx0J3NyYy8qKi8qLmQudHMnLFxuXHRcdFx0XHQnc3JjLyoqLyouY29uZmlnLionLFxuXHRcdFx0XHQnKiovKi5zcGVjLnRzJyxcblx0XHRcdFx0JyoqLyoudGVzdC50cydcblx0XHRcdF1cblx0XHR9LFxuXHRcdHNldHVwRmlsZXM6IFsnLi9zcmMvbGliL3Rlc3Qvc2V0dXAudHMnXVxuXHR9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxpQkFBaUI7QUFDblAsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUFBLEVBQ3JCLE1BQU07QUFBQSxJQUNMLFNBQVMsQ0FBQyw4QkFBOEI7QUFBQSxJQUN4QyxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLE1BQU07QUFBQSxNQUNqQyxTQUFTO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLElBQ0EsWUFBWSxDQUFDLHlCQUF5QjtBQUFBLEVBQ3ZDO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
