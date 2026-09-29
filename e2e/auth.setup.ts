import { test as setup, expect} from '@playwright/test';

setup('Save customer session', async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
        data: {
            email: "customer.a@nexo.test",
            password: process.env.TEST_USER_PASSWORD ?? "Password123!",
        },
    });
    expect(loginResponse.status()).toBe(200);
    await request.storageState({ path: 'e2e/.auth/customer.json' });


});

setup("Save agent session", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
        data: {
            email: "agent@nexo.test",
            password: process.env.TEST_USER_PASSWORD ?? "Password123!",
        },
    });
    expect(loginResponse.status()).toBe(200);
    await request.storageState({ path: 'e2e/.auth/agent.json' });


});


