import { Inject, Injectable } from '@nestjs/common';

interface GeneralObject{
    [key:string]:any
  }

@Injectable()
export class GoogleXlsxService extends GoogleAutenticarService {
    
    public getRow():Observable<string[][]>  {
        //const service = this.spreadsheetsxls
        const spreadsheetId = '13EvM-Q8-lCkVKHaxf8a_oxr_Um7A4sFbFarIdomhJTM'
        const range ='Characters'
        try {
            const res:Observable<any> = this.spreadsheetsxls.spreadsheets.values.get({spreadsheetId,range})
            
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
            const res = await this.spreadsheetsxls.spreadsheets.values.append({
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
    attributesMapping: object | string[],
    isActiveColumnName: string = 'is_active',
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
          .filter((obj: object) =>
            
            activeValues.includes(obj[isActiveColumnName].toLowerCase()
          ))
          .map(
            (entry: object) =>
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

  public rowsToEntries(rows: string[][]): object[] {
    const columns: Array<string> = rows[0].map(this.cleanColumnName);
    return rows.slice(1).map((row: Array<string>) =>
      columns.reduce((entry: object, columnName: string, idx: number) => {
        entry[columnName] = row.length > idx ? row[idx] : '';
        return entry;
      }, {})
    );
  }

  public cleanColumnName(columnName: string): string {
    return columnName.trim();
  }

  private arrayToObject(array: string[]): object {
    return array.reduce((acc, cur) => {
      acc[cur] = cur;
      return acc;
    }, {});
  }

  private getObjectFromEntry(
    entry: object,
    attributesMapping: object | string[]
  ): unknown {
    if (Array.isArray(attributesMapping)) {
      attributesMapping = this.arrayToObject(attributesMapping);
    }

    return this.getObjectFromEntryObject(entry, attributesMapping);
  }

  private getObjectFromEntryObject(
    entry: object,
    attributesMapping: object,
    columnNamePrefix: string = ''
  ): object {
    const obj: object = {};
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

  private getValueFromEntry(entry: object, attribute: string): string {
    attribute = this.cleanColumnName(attribute);
    if (entry.hasOwnProperty(attribute)) {
      return entry[attribute];
    } else {
      return null;
    }
  }

  private getListFromEntry(entry: object, attribute: string): string[] {
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