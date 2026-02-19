export namespace models {
	
	export class College {
	    Code: string;
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new College(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Code = source["Code"];
	        this.Name = source["Name"];
	    }
	}
	export class Program {
	    Code: string;
	    Name: string;
	    CollegeCode: string;
	
	    static createFrom(source: any = {}) {
	        return new Program(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Code = source["Code"];
	        this.Name = source["Name"];
	        this.CollegeCode = source["CollegeCode"];
	    }
	}
	export class Student {
	    ID: string;
	    FirstName: string;
	    LastName: string;
	    ProgramCode: string;
	    Year: string;
	    Gender: string;
	
	    static createFrom(source: any = {}) {
	        return new Student(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.FirstName = source["FirstName"];
	        this.LastName = source["LastName"];
	        this.ProgramCode = source["ProgramCode"];
	        this.Year = source["Year"];
	        this.Gender = source["Gender"];
	    }
	}

}

