import fs from 'fs/promises'; 

export type RandomData = {
    id: number;
    firstName: string;
    lastName: string;
    Age: number;
    Salary: number;
};

const getRandomItem  = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function generateData() {
    const firstNames = [
        'Aarav', 'Ananya', 'Amit', 'Priya', 'Rahul', 'Sneha', 'Rohan', 'Divya', 
        'Vikram', 'Anjali', 'Arjun', 'Kavita', 'Aditya', 'Riya', 'Sanjay', 'Deepika',
        'Vijay', 'Neha', 'Rajesh', 'Pooja', 'Abhishek', 'Meera', 'Karan', 'Kiran'
    ];
    
    const lastNames = [
        'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Mehta', 'Gupta', 
        'Das', 'Nair', 'Iyer', 'Reddy', 'Choudhury', 'Mishra', 'Yadav', 'Rao',
        'Kulkarni', 'Banerjee', 'Shah', 'Gill', 'Pillai', 'Naik', 'Kapoor', 'Malhotra'
    ];
    
    const objectToWrite: RandomData[] = [];

    for (let i = 1; i <= 50000; i++) {
        let val: RandomData = {
            id: i,
            firstName: getRandomItem(firstNames) ?? "Hari",
            lastName: getRandomItem(lastNames) ?? "Marg",
            Age: getRandomNumber(21, 60),         // Typical working age range
            Salary: getRandomNumber(25000, 250000) // Monthly or annual figure
        };
        objectToWrite.push(val);
    }

    try {
        const jsonString = JSON.stringify(objectToWrite, null, 2);
        await fs.writeFile('./Data.json', jsonString, 'utf-8');
        console.log('Successfully generated 50,000 records in indianData.json');
    } catch (error) {
        console.error('Error writing file:', error);
    }
}

generateData();