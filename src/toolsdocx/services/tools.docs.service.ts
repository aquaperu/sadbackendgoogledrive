import { Inject, Injectable } from "@nestjs/common";
import { ToolsDocsConfig } from "../types/tools.docs.config";

@Injectable()
export class ToolsDocsService {
    constructor(
        @Inject("CONFIG") private config: ToolsDocsConfig,
    ){}
    setHeaderIndexImageFileRight(path:string){
        this.config.headerIndexImageFileRight = path
    }

    addHeader(textoCabecera:string){
        

    }
    
}