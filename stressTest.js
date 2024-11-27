const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { performance } = require('perf_hooks');

// Fungsi untuk memberikan delay waktu
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stressTestUI(url, duration, users, inputElement, inputValue, buttonElement) {
    const options = new chrome.Options();
    options.addArguments('headless');
    options.addArguments('disable-gpu');

    let totalLoadTime = 0;
    let successCount = 0;
    let errorCount = 0;
    const totalTests = users; 

    const drivers = [];
    const userResults = [];
    
    const startTimeOverall = performance.now();  // Waktu mulai keseluruhan pengujian

    console.log(`Memulai pengujian untuk URL: ${url} dengan ${users} pengguna...\n`);

    try {
        await Promise.all(
            Array.from({ length: users }, async (_, i) => {
                const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
                drivers.push(driver);

                const startTimeUser = performance.now();  // Waktu mulai untuk setiap pengguna
                const elapsedTime = (startTimeUser - startTimeOverall) / 1000;  // Elapsed time dalam detik

                // Log untuk mendeteksi kapan pengguna dimulai
                console.log(`User ${i + 1}: Dimulai setelah ${elapsedTime.toFixed(2)} detik.`);

                const startTime = performance.now();

                try {
                    await driver.get(url);

                    await driver.wait(until.elementsLocated(By.css(inputElement)), duration * 1000); // Menunggu elemen kolom

                    const input = await driver.findElement(By.css(inputElement));
                    await input.sendKeys(inputValue); // Mengisi kolom dengan nilai

                    const button = await driver.findElement(By.css(buttonElement));
                    await button.click(); // Mengklik tombol

                    const endTime = performance.now();
                    const loadTime = (endTime - startTime) / 1000;

                    totalLoadTime += loadTime;
                    successCount++;
                    userResults.push({ userId: i + 1, loadTime });
                    console.log(`Pengguna ${i + 1}: Pengujian selesai dalam ${loadTime.toFixed(2)} detik.`);
                } catch (error) {
                    console.error(`Pengguna ${i + 1}: Pengujian gagal.`);
                    errorCount++;
                }
            })
        );

        const avgLoadTime = successCount > 0 ? (totalLoadTime / successCount).toFixed(2) : 0;

        const result = {
            success: successCount > 0,
            results: [{
                url: url,
                totalTests: totalTests,
                successCount: successCount,
                errorCount: errorCount,
                totalLoadTime: totalLoadTime.toFixed(2),
                avgLoadTime: avgLoadTime,
                successRate: ((successCount / totalTests) * 100).toFixed(2),
                errorRate: ((errorCount / totalTests) * 100).toFixed(2),
                userResults: userResults
            }]
        };

        // Menampilkan hasil log pengujian di konsol secara rapi
        console.log("\nHasil Pengujian:\n");
        console.log(JSON.stringify(result, null, 2)); // Log rapi dengan indentasi

        return result;
    } catch (error) {
        console.error(`Terjadi kesalahan dalam pengujian: ${error}`);
        return { success: false, message: error.message };
    } finally {
        await Promise.all(drivers.map(driver => driver.quit()));
    }
}


module.exports = stressTestUI;
