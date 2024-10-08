import { HttpException, Inject, Injectable } from '@nestjs/common';
import { GoogleAutenticarService } from './googleautenticar.service';
import { Observable, catchError, from, map, throwError } from 'rxjs';

interface GeneralObject{
    [key:string]:any
  }

@Injectable()
export class GoogleXlsxService extends GoogleAutenticarService {
    
  public createSheet(spreadsheetId:string,nameSheet:string){
    
    try {
            const res:Observable<any> = this.xlsx.spreadsheets.batchUpdate({
              spreadsheetId: spreadsheetId,
              requestBody: {
                requests: [{
                  addSheet: {
                    properties: {
                      title: nameSheet,
                    }
                  }
                }]
              }
            })
            console.log(this.googleXlsxSpreadSheetId)
            
            return res
        
          } catch (err) {
            // TODO (developer) - Handle exception
            throw err;
          }
    }
    public getRow():Observable<string[][]>  {
        //const service = this.spreadsheetsxls
        const spreadsheetId = '13EvM-Q8-lCkVKHaxf8a_oxr_Um7A4sFbFarIdomhJTM'
        const range ='Characters'
        try {
            const res:Observable<any> = this.xlsx.spreadsheets.values.get({spreadsheetId,range})
            
            return res
          } catch (err) {
            // TODO (developer) - Handle exception
            throw err;
          }
    }
    public async setRow<T>(data:T){
      const spreadsheetId = '13EvM-Q8-lCkVKHaxf8a_oxr_Um7A4sFbFarIdomhJTM'
        const range ='Characters'
        const valueInputOption='USER_ENTERED'
        const dataInput: T = data
  
        const resource = {values: dataInput};
          try {
            const res = await this.xlsx.spreadsheets.values.append({
              spreadsheetId,range,valueInputOption,resource
            })
            return res.status
          } catch (err) {
            // TODO (developer) - Handle exception
            throw err;
          }
    }
    defaultActiveValues: any[] = ['true', '1', 'yes'];


  
  /*public get<T>(
    spreadsheetId: string,
    worksheetName: string,
    attributesMapping: object | string[]
  ): Observable<T[]> {
    return this.getRows(spreadsheetId, worksheetName).pipe(
      map((rows: string[][]) =>
        this.rowsToEntries(rows).map(
          (entry: object) =>
            this.getObjectFromEntry(entry, attributesMapping) as T
        )
      )
    );
  }*/

  public getActive<T>(
    spreadsheetId: string,
    worksheetName: string,
    attributesMapping: GeneralObject | string[],
    isActiveColumnName: string = 'Active',
    activeValues: string[] | string = null
  ): Observable<T[]>  {


    if (activeValues === null) {
      activeValues = this.defaultActiveValues;
    } else if (!Array.isArray(activeValues)) {
      activeValues = [activeValues];
    }
    return this.getRows(spreadsheetId, worksheetName).pipe(
      map((rows: any) =>
        this.rowsToEntries(rows.data.values) 
          .filter((obj: GeneralObject) =>
            
            activeValues.includes(obj[isActiveColumnName]//.toLowerCase()
          ))
          .map(
            (entry: GeneralObject) =>
              this.getObjectFromEntry(entry, attributesMapping) as T
          )
         
      )
    );
  }

  

  private getRows(
    spreadsheetId: string,
    worksheetName: string
  ): Observable<string[][]> | any{
    return from(this.getRow())//las hojas de calculo de google spread sheet retornan promesas. para comvertir a observables se usa from
    .pipe(
      map((jsonRes) => jsonRes),
      catchError(this.handleError)
    );
  }

  public rowsToEntries(rows: string[][]): GeneralObject[] {
    const columns: Array<string> = rows[0].map(this.cleanColumnName);
    return rows.slice(1).map((row: Array<string>) =>
      columns.reduce((entry: GeneralObject, columnName: string, idx: number) => {
        entry[columnName] = row.length > idx ? row[idx] : '';
        return entry;
      }, {})
    );
  }

  public cleanColumnName(columnName: string): string {
    return columnName.trim();
  }

  private arrayToObject(array: string[]): GeneralObject {
    return array.reduce((acc, cur) => {
      acc[cur] = cur;
      return acc;
    }, {});
  }

  private getObjectFromEntry(
    entry: GeneralObject,
    attributesMapping: GeneralObject | string[]
  ): unknown {
    if (Array.isArray(attributesMapping)) {
      attributesMapping = this.arrayToObject(attributesMapping);
    }

    return this.getObjectFromEntryObject(entry, attributesMapping);
  }

  private getObjectFromEntryObject(
    entry: GeneralObject,
    attributesMapping: GeneralObject,
    columnNamePrefix: string = ''
  ): GeneralObject {
    const obj: GeneralObject = {};
    for (const attr in Object(attributesMapping)) {
      if (
        attributesMapping.hasOwnProperty(attr) &&
        !['_prefix', '_listField'].includes(attr)
      ) {
        if (typeof attributesMapping[attr] === 'string') {
          obj[attr] = this.getValueFromEntry(
            entry,
            columnNamePrefix + attributesMapping[attr]
          );
        } else if (typeof attributesMapping[attr] === 'object') {
          let columnName = '';
          if (attributesMapping[attr].hasOwnProperty('_prefix')) {
            columnName = attributesMapping[attr]._prefix;
          }

          if (attributesMapping[attr]._listField) {
            obj[attr] = this.getListFromEntry(
              entry,
              columnNamePrefix + columnName
            );
          } else {
            obj[attr]<= this.getObjectFromEntryObject(
              entry,
              attributesMapping[attr],
              columnNamePrefix + columnName
            );
          }
        } else {
          console.log(`Unknown type for ${attr}`);
        }
      }
    }

    return obj;
  }

  private getValueFromEntry(entry: GeneralObject, attribute: string): string {
    attribute = this.cleanColumnName(attribute);
   // if (entry.hasOwnProperty(attribute)) {
      return entry[attribute];
    /*} else {
      return null;
    }*/
  }

  private getListFromEntry(entry: GeneralObject, attribute: string): string[] {
    const list: string[] = [];

    let i = 1;
    let curElement: string = this.getValueFromEntry(entry, `${attribute}${i}`);
    while (curElement) {
      list.push(curElement);
      i++;
      curElement = this.getValueFromEntry(entry, `${attribute}${i}`);
    }

    return list;
  }

  private handleError(error: HttpException): Observable<never> {
    return  throwError('algo a sucedido; please try again later.');
  }

}