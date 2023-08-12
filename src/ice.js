const iceJson = require('./hannoIce.json');
const solver = require('../node_modules/javascript-lp-solver/src/solver');

class Model {
    constructor(constraints, variables) {
        
        this.optimize = "cost";
        this.opType = "min",
        this.constraints = constraints,
        this.variables = variables

    }   

    solve = () => {  
        const result = {

            "optimize": this.optimize,
            "opType": this.opType,
            "constraints": this.constraints,
            "variables": this.variables,
            "ints": {}
        };

        const variableKeys = Object.keys(result["variables"]);

        variableKeys.forEach((key) => result["ints"][key] = 1);
        
        return solver.Solve(result);
    }
}

class Blueprint {

    constructor(iceArray, priceJson, refine) {
        this.heavyWater = iceArray[0];
        this.liquidOzone = iceArray[1];
        this.heliumIso = iceArray[2];
        this.strontClath = iceArray[3];
        this.hydroIso = iceArray[4];
        this.oxyIso = iceArray[5];
        this.nitroIso = iceArray[6];
        //Deep copy
        this.prices = JSON.parse(JSON.stringify(priceJson));
        this.refineNumber = refine;
    }

    formatConstraint = () => {
        const constraints = {
            "heavyWater": {"min": this.heavyWater},
            "liquidOzone": {"min": this.liquidOzone},
            "heliumIsotopes": {"min": this.heliumIso},
            "strontiumClathrates": {"min": this.strontClath},
            "hydrogenIsotopes": {"min": this.hydroIso},
            "oxygenIsotopes": {"min": this.oxyIso},
            "nitrogenIsotopes": {"min": this.nitroIso}
        };

        return constraints
    }

    formatVariable = () => {
        const variable = {};
        let refineNum = new Refine(this.refineNumber);
        refineNum = refineNum.buildFormula();

        this.prices.forEach((item) => {
            let iceName = Object.keys(item);

            iceName = iceName[0];
            const refineModify = Object.keys(item[iceName]);

            refineModify.forEach((mineral) => {
                if (mineral !== "cost") {
                    item[iceName][mineral] *= (refineNum / 100);
                }
            });

            if (typeof item[iceName]["cost"] === "number") {
                variable[iceName] = item[iceName];

            }
        });
        return variable;
    }

    LPSolve = () => {
        const constraints = this.formatConstraint();
        const variables = this.formatVariable();

        const result = new Model(constraints, variables);
        return result.solve();
    }

} 

class Refine {

    constructor(refineSettings) {
        this.structure = refineSettings.structureSelect;
        this.rig = refineSettings.rigSelect;
        this.security = refineSettings.securitySelect;
        this.reprocessing = refineSettings.reprocessingSelect;
        this.efficiency = refineSettings.efficiencySelect;
        this.oreProcessing = refineSettings.oreProcessingSelect;
    }

    buildFormula = () => {
        
        let structureValue = 1;
        let securityValue = 1;
        let rigValue = 1;
        let reprocess = 1;
        let efficiency = 1;
        let oreProcess = 1;

        switch(this.structure) {
            case "TATARA":
                structureValue = 0.055;
                break;
            case "ATHANOR":
                structureValue = 0.02;
                break;
            case "NPC/OTHER STRUCTURE":
                structureValue = 0;
                break;
        }

        switch(this.rig) {
            case "T2 RIG":
                rigValue = 3;
                break;
            case "T1 RIG":
                rigValue = 1;
                break;
            case "NO RIG":
                rigValue = 0;
                break;
        }

        switch(this.security) {
            case "J-SPACE":
                securityValue = 0.12;
                break;
            case "NULL-SEC":
                securityValue = 0.12;
                break;
            case "LOW-SEC":
                securityValue = 0.06;
                break;
            case "HIGH-SEC":
                securityValue = 0;
                break;
        }

        switch(this.reprocessing) {
            case "REPROCESSING V":
                reprocess = 5;
                break;
            case "REPROCESSING IV":
                reprocess = 4;
                break;
            case "REPROCESSING III":
                reprocess = 3;
                break;
            case "REPROCESSING II":
                reprocess = 2;
                break;
            case "REPROCESSING I":
                reprocess = 1;
                break;
        }

        switch(this.efficiency) {
            case "REPROCESSING EFFICIENCY V":
                efficiency = 5;
                break;
            case "REPROCESSING EFFICIENCY IV":
                efficiency = 4;
                break;
            case "REPROCESSING EFFICIENCY III":
                efficiency = 3;
                break;
            case "REPROCESSING EFFICIENCY II":
                efficiency = 2;
                break;
            case "REPROCESSING EFFICIENCY I":
                efficiency = 1;
                break;
        }

        switch(this.oreProcessing) {
            case "ORE PROCESSING V":
                oreProcess = 5;
                break;
            case "ORE PROCESSING IV":
                oreProcess = 4;
                break;
            case "ORE PROCESSING III":
                oreProcess = 3;
                break;
            case "ORE PROCESSING II":
                oreProcess = 2;
                break;
            case "ORE PROCESSING I":
                oreProcess = 1;
                break;
        }

        //REPROCESSING FORMULA ACCORDING TO EVE=UNI
        const reprocessingModifier = (((50 + rigValue) * (1 + securityValue)) * (1 + structureValue) *
        (1 + (0.03 * reprocess)) * (1 + (0.02 * efficiency)) * (1 + (0.02 * oreProcess)) * (1));
        
        console.log(reprocessingModifier);

        return reprocessingModifier;
    }

}

const hannoInput = (iceArr, iceRefine) => {

    return function() {

        const newBP = new Blueprint(iceArr, iceJson["table"], iceRefine);
        const solution = newBP.LPSolve();
        console.log(solution);
        return solution
    }

}

module.exports.hannoInput = hannoInput;