// test-ts-resolution.ts
// Test if TypeScript can resolve these imports
import test1 from "@/app/api/ApiUser";
import test2 from "@/app/components/teams/Team";
import test3 from "@/app/config/BaseConfig";

console.log("Test imports should work if TypeScript paths are configured correctly");