

interface IDefineHeader {
    imagePosition?: {
        transformation?: { width: number, height: number },
        horizontalPosition?: {
            offset: number
        },
        verticalPosition?: {
            offset: number
        },
        wrap?: {
            side: string,
            type: 1
        }
    }
}

interface IHeaderStrategy{
    doBuildHeader(imageHeader:IDefineHeader):any
}

class Context {
    /**
     * @type {IHeaderStrategy} The Context maintains a reference to one of the Strategy
     * objects. The Context does not know the concrete class of a strategy. It
     * should work with all strategies via the Strategy interface.
     */
    private strategy: IHeaderStrategy;

    /**
     * Usually, the Context accepts a strategy through the constructor, but also
     * provides a setter to change it at runtime.
     */
    constructor(strategy: IHeaderStrategy) {
        this.strategy = strategy;
    }

    /**
     * Usually, the Context allows replacing a Strategy object at runtime.
     */
    public setStrategy(strategy: IHeaderStrategy) {
        this.strategy = strategy;
    }

    /**
     * The Context delegates some work to the Strategy object instead of
     * implementing multiple versions of the algorithm on its own.
     */
    public doSomeBusinessLogic(): void {
        // ...

        console.log('Context: Sorting data using the strategy (not sure how it\'ll do it)');
//        const result = this.strategy.doBuildHeader({imagePosition});
  //      console.log(result.join(','));

        // ...
    }
}

