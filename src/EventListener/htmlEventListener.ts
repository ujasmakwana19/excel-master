import { LoadToTheGrid } from "../DataLoader/LoadJsonData.js";

export function HandleLoadJsonData() : void {
    const loadBtn = document.getElementById('load-data-btn') as HTMLButtonElement;

    const fileInput = document.getElementById('json-upload') as HTMLInputElement;
    const offsetInput = document.getElementById('row-offset') as HTMLInputElement;
    
    loadBtn.addEventListener('click', triggerDataLoading);
    
    function triggerDataLoading() {

        const file : File | undefined = fileInput.files?.[0];

        if (!file) {
            alert("Please select a JSON file!");
            return;
        }
        
        let userOffset : number = parseInt(offsetInput.value, 10);
        if (isNaN(userOffset) || userOffset < 1) {
            userOffset = 1;
        }
        
        
        const reader = new FileReader();
        let parsedData : unknown = {}

        // On complete of the reader it performs the parsing
        reader.onload = function (e) {
            try {
                const rawResult = e.target?.result as string;
                parsedData = JSON.parse(rawResult);
                
            } catch (error) {
                alert("Error parsing file. Please make sure it's a valid JSON format.");
                // console.error(error);
            }
        };
        
        // Reader that reads the data
        reader.readAsText(file);

        LoadToTheGrid(parsedData, userOffset);
    }
}
