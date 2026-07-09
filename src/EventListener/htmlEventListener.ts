import { JsonDataLoader } from "../DataLoader/LoadJsonData.js";
import type { RandomData } from "../DataLoader/jsonDataMaker.js"
import type { Grid } from "../Grid.js";

// To load the json data
export function HandleLoadJsonData(grid : Grid): void {
    const loadBtn = document.getElementById('load-data-btn') as HTMLButtonElement;
    const fileInput = document.getElementById('json-upload') as HTMLInputElement;
    const offsetInput = document.getElementById('row-offset') as HTMLInputElement;

    loadBtn.addEventListener('click', triggerDataLoading);

    async function triggerDataLoading() {
        const file: File | undefined = fileInput.files?.[0];

        if (!file) {
            alert("Please select a JSON file!");
            return;
        }

        let userOffset: number = parseInt(offsetInput.value, 10);
        if (isNaN(userOffset) || userOffset < 1) {
            userOffset = 1;
        }

        let parsedData: RandomData[];
        try {
            parsedData = await readJsonFile(file);
        } catch (error) {
            alert("Error parsing file. Please make sure it's a valid JSON format.");
            // console.error(error);
            return; 
        }

        new JsonDataLoader(grid).LoadToTheGrid(parsedData, userOffset);
    }

    // Callback function to handle the file reading and parsing , in synchronous manner
    function readJsonFile(file: File): Promise<RandomData[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const rawResult = e.target?.result as string;
                    resolve(JSON.parse(rawResult));
                } catch (error) {
                    reject(error);
                }
            };

            // reader.onerror = () => reject(reader.error);
            reader.onerror = () => reject("Unsupported Type");

            reader.readAsText(file);
        });
    }
}


//  To convert to the dark mode
export function HandleDarkModeToggle(grid: Grid): void {
    const darkModeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
    darkModeToggle.addEventListener('click', () => {
        grid.darkMode = !grid.darkMode;
        grid.render();
    });
}
