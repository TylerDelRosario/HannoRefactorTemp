const oreJson = require("./hanno.json");
const solver = require("../node_modules/javascript-lp-solver/src/solver");

class Model {

    constructor(constraints, variables) {

        this.optimize = "cost",
        this.opType = "min",
        this.constraints = constraints,
        this.variables = variables

    }

    solve() {
        const result = {

            "optimize": this.optimize,
            "opType": this.opType,
            "constraints": this.constraints,
            "variables": this.variables

        };
        console.log(result);
        return solver.Solve(result);
    }

    
}

class Blueprint {

    constructor(mineralArray, priceJson, refine) {
        this.tri = mineralArray[0];
        this.pye = mineralArray[1];
        this.mex = mineralArray[2];
        this.iso = mineralArray[3];
        this.noc = mineralArray[4];
        this.zyd = mineralArray[5];
        this.meg = mineralArray[6];
        this.mor = mineralArray[7];
        this.prices = JSON.parse(JSON.stringify(priceJson));
        this.refineNumber = refine;
    }

    formatConstraint = () => {       
        const constraint = {
            "tritanium": {"min": this.tri},
            "pyerite": {"min": this.pye},
            "mexallon": {"min": this.mex},
            "isogen": {"min": this.iso},
            "nocxium": {"min": this.noc},
            "zydrine": {"min": this.zyd},
            "megacyte": {"min": this.meg},
            "morphite": {"min": this.mor}
        }
        return constraint;
    }

    formatVariable = () => {
        let variable = {};
        let refineNum = new Refine(this.refineNumber);
        refineNum = refineNum.buildFormula();

        this.prices.forEach((item) => {
            let oreName = Object.keys(item);
            
            oreName = oreName[0];
            const refineModify = Object.keys(item[oreName]);

            refineModify.forEach((mineral) => {
                if (mineral !== "cost") {
                    item[oreName][mineral] *= (refineNum / 100);
                }
            });


            if (typeof item[oreName]["cost"] === "number") {
            //Round down price to integer.
            item[oreName]["cost"] = Math.floor(item[oreName]["cost"]);
            variable[oreName] = item[oreName];
            console.log(item[oreName], refineNum);
            }
        });

        return variable;
    }

    LPSolve = () => {

        const lpConstraint = this.formatConstraint();
        const lpVariables = this.formatVariable();

        const result = new Model(lpConstraint, lpVariables);

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

const hannoInput = (minArr, minRefine) => {

    return function() {
        
        const newBP = new Blueprint(minArr, oreJson["table"], minRefine);
        const solution = newBP.LPSolve();
        return solution;
    };

}

module.exports.hannoInput = hannoInput;