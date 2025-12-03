export const vueDtsMap = new Map<string, string>();

vueDtsMap.set('file:///node_modules/vue/index.d.ts', `import { CompilerOptions } from '@vue/compiler-dom';
import { RenderFunction } from '@vue/runtime-dom';
export * from '@vue/runtime-dom';

export declare function compileToFunction(template: string | HTMLElement, options?: CompilerOptions): RenderFunction;

export { compileToFunction as compile };
`);

vueDtsMap.set('file:///node_modules/@vue/runtime-dom/index.d.ts', `import { RendererOptions, BaseTransitionProps, FunctionalComponent, ObjectDirective, Directive, SetupContext, RenderFunction, ComponentOptions, App, ComponentCustomElementInterface, ConcreteComponent, CreateAppFunction, ComponentObjectPropsOptions, EmitsOptions, ComputedOptions, MethodOptions, ComponentOptionsMixin, ComponentInjectOptions, SlotsType, Component, ComponentProvideOptions, ExtractPropTypes, EmitsToProps, ComponentOptionsBase, CreateComponentPublicInstanceWithMixins, ComponentPublicInstance, DefineComponent, VNodeRef, RootRenderFunction, RootHydrateFunction } from '@vue/runtime-core';
export * from '@vue/runtime-core';
import * as CSS from 'csstype';

export declare const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'>;

type DOMRendererOptions = RendererOptions<Node, Element>;
export declare const patchProp: DOMRendererOptions['patchProp'];

declare const TRANSITION = "transition";
declare const ANIMATION = "animation";
type AnimationTypes = typeof TRANSITION | typeof ANIMATION;
export interface TransitionProps extends BaseTransitionProps<Element> {
    name?: string;
    type?: AnimationTypes;
    css?: boolean;
    duration?: number | {
        enter: number;
        leave: number;
    };
    enterFromClass?: string;
    enterActiveClass?: string;
    enterToClass?: string;
    appearFromClass?: string;
    appearActiveClass?: string;
    appearToClass?: string;
    leaveFromClass?: string;
    leaveActiveClass?: string;
    leaveToClass?: string;
}
/**
 * DOM Transition is a higher-order-component based on the platform-agnostic
 * base Transition component, with DOM-specific logic.
 */
export declare const Transition: FunctionalComponent<TransitionProps>;

export type TransitionGroupProps = Omit<TransitionProps, 'mode'> & {
    tag?: string;
    moveClass?: string;
};
export declare const TransitionGroup: {
    new (): {
        \$props: TransitionGroupProps;
    };
};

declare const vShowOriginalDisplay: unique symbol;
declare const vShowHidden: unique symbol;
interface VShowElement extends HTMLElement {
    [vShowOriginalDisplay]: string;
    [vShowHidden]: boolean;
}
export declare const vShow: ObjectDirective<VShowElement> & {
    name: 'show';
};

declare const systemModifiers: readonly ["ctrl", "shift", "alt", "meta"];
type SystemModifiers = (typeof systemModifiers)[number];
type CompatModifiers = keyof typeof keyNames;
type VOnModifiers = SystemModifiers | ModifierGuards | CompatModifiers;
type ModifierGuards = 'shift' | 'ctrl' | 'alt' | 'meta' | 'left' | 'right' | 'stop' | 'prevent' | 'self' | 'middle' | 'exact';
/**
 * @private
 */
export declare const withModifiers: <T extends (event: Event, ...args: unknown[]) => any>(fn: T & {
    _withMods?: {
        [key: string]: T;
    };
}, modifiers: VOnModifiers[]) => T;
declare const keyNames: Record<'esc' | 'space' | 'up' | 'left' | 'right' | 'down' | 'delete', string>;
/**
 * @private
 */
export declare const withKeys: <T extends (event: KeyboardEvent) => any>(fn: T & {
    _withKeys?: {
        [k: string]: T;
    };
}, modifiers: string[]) => T;
type VOnDirective = Directive<any, any, VOnModifiers>;

type AssignerFn = (value: any) => void;
declare const assignKey: unique symbol;
type ModelDirective<T, Modifiers extends string = string> = ObjectDirective<T & {
    [assignKey]: AssignerFn;
    _assigning?: boolean;
}, any, Modifiers>;
export declare const vModelText: ModelDirective<HTMLInputElement | HTMLTextAreaElement, 'trim' | 'number' | 'lazy'>;
export declare const vModelCheckbox: ModelDirective<HTMLInputElement>;
export declare const vModelRadio: ModelDirective<HTMLInputElement>;
export declare const vModelSelect: ModelDirective<HTMLSelectElement, 'number'>;
export declare const vModelDynamic: ObjectDirective<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
type VModelDirective = typeof vModelText | typeof vModelCheckbox | typeof vModelSelect | typeof vModelRadio | typeof vModelDynamic;

export type VueElementConstructor<P = {}> = {
    new (initialProps?: Record<string, any>): VueElement & P;
};
export interface CustomElementOptions {
    styles?: string[];
    shadowRoot?: boolean;
    shadowRootOptions?: Omit<ShadowRootInit, 'mode'>;
    nonce?: string;
    configureApp?: (app: App) => void;
}
export declare function defineCustomElement<Props, RawBindings = object>(setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction, options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> & CustomElementOptions & {
    props?: (keyof Props)[];
}): VueElementConstructor<Props>;
export declare function defineCustomElement<Props, RawBindings = object>(setup: (props: Props, ctx: SetupContext) => RawBindings | RenderFunction, options?: Pick<ComponentOptions, 'name' | 'inheritAttrs' | 'emits'> & CustomElementOptions & {
    props?: ComponentObjectPropsOptions<Props>;
}): VueElementConstructor<Props>;
export declare function defineCustomElement<RuntimePropsOptions extends ComponentObjectPropsOptions = ComponentObjectPropsOptions, PropsKeys extends string = string, RuntimeEmitsOptions extends EmitsOptions = {}, EmitsKeys extends string = string, Data = {}, SetupBindings = {}, Computed extends ComputedOptions = {}, Methods extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, InjectOptions extends ComponentInjectOptions = {}, InjectKeys extends string = string, Slots extends SlotsType = {}, LocalComponents extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, InferredProps = string extends PropsKeys ? ComponentObjectPropsOptions extends RuntimePropsOptions ? {} : ExtractPropTypes<RuntimePropsOptions> : {
    [key in PropsKeys]?: any;
}, ResolvedProps = InferredProps & EmitsToProps<RuntimeEmitsOptions>>(options: CustomElementOptions & {
    props?: (RuntimePropsOptions & ThisType<void>) | PropsKeys[];
} & ComponentOptionsBase<ResolvedProps, SetupBindings, Data, Computed, Methods, Mixin, Extends, RuntimeEmitsOptions, EmitsKeys, {}, // Defaults
InjectOptions, InjectKeys, Slots, LocalComponents, Directives, Exposed, Provide> & ThisType<CreateComponentPublicInstanceWithMixins<Readonly<ResolvedProps>, SetupBindings, Data, Computed, Methods, Mixin, Extends, RuntimeEmitsOptions, EmitsKeys, {}, false, InjectOptions, Slots, LocalComponents, Directives, Exposed>>, extraOptions?: CustomElementOptions): VueElementConstructor<ResolvedProps>;
export declare function defineCustomElement<T extends {
    new (...args: any[]): ComponentPublicInstance<any>;
}>(options: T, extraOptions?: CustomElementOptions): VueElementConstructor<T extends DefineComponent<infer P, any, any, any> ? P : unknown>;
export declare const defineSSRCustomElement: typeof defineCustomElement;
declare const BaseClass: typeof HTMLElement;
type InnerComponentDef = ConcreteComponent & CustomElementOptions;
export declare class VueElement extends BaseClass implements ComponentCustomElementInterface {
    /**
     * Component def - note this may be an AsyncWrapper, and this._def will
     * be overwritten by the inner component when resolved.
     */
    private _def;
    private _props;
    private _createApp;
    _isVueCE: boolean;
    private _connected;
    private _resolved;
    private _patching;
    private _dirty;
    private _numberProps;
    private _styleChildren;
    private _pendingResolve;
    private _parent;
    /**
     * dev only
     */
    private _styles?;
    /**
     * dev only
     */
    private _childStyles?;
    private _ob?;
    private _slots?;
    constructor(
    /**
     * Component def - note this may be an AsyncWrapper, and this._def will
     * be overwritten by the inner component when resolved.
     */
    _def: InnerComponentDef, _props?: Record<string, any>, _createApp?: CreateAppFunction<Element>);
    connectedCallback(): void;
    private _setParent;
    private _inheritParentContext;
    disconnectedCallback(): void;
    private _processMutations;
    /**
     * resolve inner component definition (handle possible async component)
     */
    private _resolveDef;
    private _mount;
    private _resolveProps;
    protected _setAttr(key: string): void;
    private _update;
    private _createVNode;
    private _applyStyles;
    /**
     * Only called when shadowRoot is false
     */
    private _parseSlots;
    /**
     * Only called when shadowRoot is false
     */
    private _renderSlots;
}
export declare function useHost(caller?: string): VueElement | null;
/**
 * Retrieve the shadowRoot of the current custom element. Only usable in setup()
 * of a \`defineCustomElement\` component.
 */
export declare function useShadowRoot(): ShadowRoot | null;

export declare function useCssModule(name?: string): Record<string, string>;

/**
 * Runtime helper for SFC's CSS variable injection feature.
 * @private
 */
export declare function useCssVars(getter: (ctx: any) => Record<string, unknown>): void;

export interface CSSProperties extends CSS.Properties<string | number>, CSS.PropertiesHyphen<string | number> {
    /**
     * The index signature was removed to enable closed typing for style
     * using CSSType. You're able to use type assertion or module augmentation
     * to add properties or an index signature of your own.
     *
     * For examples and more information, visit:
     * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
     */
    [v: \`--\${string}\`]: string | number | undefined;
}
type Booleanish = boolean | 'true' | 'false';
type Numberish = number | string;
export interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    'aria-activedescendant'?: string | undefined;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    'aria-atomic'?: Booleanish | undefined;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    'aria-busy'?: Booleanish | undefined;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    'aria-checked'?: Booleanish | 'mixed' | undefined;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    'aria-colcount'?: Numberish | undefined;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    'aria-colindex'?: Numberish | undefined;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    'aria-colspan'?: Numberish | undefined;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    'aria-controls'?: string | undefined;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    'aria-current'?: Booleanish | 'page' | 'step' | 'location' | 'date' | 'time' | undefined;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    'aria-describedby'?: string | undefined;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    'aria-details'?: string | undefined;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    'aria-disabled'?: Booleanish | undefined;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    'aria-errormessage'?: string | undefined;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    'aria-expanded'?: Booleanish | undefined;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    'aria-flowto'?: string | undefined;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    'aria-grabbed'?: Booleanish | undefined;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    'aria-haspopup'?: Booleanish | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    'aria-hidden'?: Booleanish | undefined;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    'aria-invalid'?: Booleanish | 'grammar' | 'spelling' | undefined;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    'aria-keyshortcuts'?: string | undefined;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    'aria-label'?: string | undefined;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    'aria-labelledby'?: string | undefined;
    /** Defines the hierarchical level of an element within a structure. */
    'aria-level'?: Numberish | undefined;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    'aria-live'?: 'off' | 'assertive' | 'polite' | undefined;
    /** Indicates whether an element is modal when displayed. */
    'aria-modal'?: Booleanish | undefined;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    'aria-multiline'?: Booleanish | undefined;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    'aria-multiselectable'?: Booleanish | undefined;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    'aria-orientation'?: 'horizontal' | 'vertical' | undefined;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    'aria-owns'?: string | undefined;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string | undefined;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    'aria-posinset'?: Numberish | undefined;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    'aria-pressed'?: Booleanish | 'mixed' | undefined;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    'aria-readonly'?: Booleanish | undefined;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals' | undefined;
    /** Indicates that user input is required on the element before a form may be submitted. */
    'aria-required'?: Booleanish | undefined;
    /** Defines a human-readable, author-localized description for the role of an element. */
    'aria-roledescription'?: string | undefined;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    'aria-rowcount'?: Numberish | undefined;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    'aria-rowindex'?: Numberish | undefined;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    'aria-rowspan'?: Numberish | undefined;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    'aria-selected'?: Booleanish | undefined;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    'aria-setsize'?: Numberish | undefined;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined;
    /** Defines the maximum allowed value for a range widget. */
    'aria-valuemax'?: Numberish | undefined;
    /** Defines the minimum allowed value for a range widget. */
    'aria-valuemin'?: Numberish | undefined;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    'aria-valuenow'?: Numberish | undefined;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    'aria-valuetext'?: string | undefined;
}
export type StyleValue = false | null | undefined | string | CSSProperties | Array<StyleValue>;
export interface HTMLAttributes extends AriaAttributes, EventHandlers<Events> {
    innerHTML?: string | undefined;
    class?: any;
    style?: StyleValue | undefined;
    accesskey?: string | undefined;
    contenteditable?: Booleanish | 'inherit' | 'plaintext-only' | undefined;
    contextmenu?: string | undefined;
    dir?: string | undefined;
    draggable?: Booleanish | undefined;
    enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined;
    /**
     * @deprecated Use \`enterkeyhint\` instead.
     */
    enterKeyHint?: HTMLAttributes['enterkeyhint'];
    hidden?: Booleanish | '' | 'hidden' | 'until-found' | undefined;
    id?: string | undefined;
    inert?: Booleanish | undefined;
    lang?: string | undefined;
    placeholder?: string | undefined;
    spellcheck?: Booleanish | undefined;
    tabindex?: Numberish | undefined;
    title?: string | undefined;
    translate?: 'yes' | 'no' | undefined;
    radiogroup?: string | undefined;
    role?: string | undefined;
    about?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    resource?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;
    autocapitalize?: string | undefined;
    autocorrect?: string | undefined;
    autosave?: string | undefined;
    color?: string | undefined;
    itemprop?: string | undefined;
    itemscope?: Booleanish | undefined;
    itemtype?: string | undefined;
    itemid?: string | undefined;
    itemref?: string | undefined;
    results?: Numberish | undefined;
    security?: string | undefined;
    unselectable?: 'on' | 'off' | undefined;
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | undefined;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts
     */
    exportparts?: string;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part
     */
    part?: string;
}
type HTMLAttributeReferrerPolicy = '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
export interface AnchorHTMLAttributes extends HTMLAttributes {
    download?: any;
    href?: string | undefined;
    hreflang?: string | undefined;
    media?: string | undefined;
    ping?: string | undefined;
    rel?: string | undefined;
    target?: string | undefined;
    type?: string | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
}
export interface AreaHTMLAttributes extends HTMLAttributes {
    alt?: string | undefined;
    coords?: string | undefined;
    download?: any;
    href?: string | undefined;
    hreflang?: string | undefined;
    media?: string | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
    rel?: string | undefined;
    shape?: string | undefined;
    target?: string | undefined;
}
export interface AudioHTMLAttributes extends MediaHTMLAttributes {
}
export interface BaseHTMLAttributes extends HTMLAttributes {
    href?: string | undefined;
    target?: string | undefined;
}
export interface BlockquoteHTMLAttributes extends HTMLAttributes {
    cite?: string | undefined;
}
export interface ButtonHTMLAttributes extends HTMLAttributes {
    autofocus?: Booleanish | undefined;
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    formaction?: string | undefined;
    formenctype?: string | undefined;
    formmethod?: string | undefined;
    formnovalidate?: Booleanish | undefined;
    formtarget?: string | undefined;
    name?: string | undefined;
    type?: 'submit' | 'reset' | 'button' | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface CanvasHTMLAttributes extends HTMLAttributes {
    height?: Numberish | undefined;
    width?: Numberish | undefined;
}
export interface ColHTMLAttributes extends HTMLAttributes {
    span?: Numberish | undefined;
    width?: Numberish | undefined;
}
export interface ColgroupHTMLAttributes extends HTMLAttributes {
    span?: Numberish | undefined;
}
export interface DataHTMLAttributes extends HTMLAttributes {
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface DetailsHTMLAttributes extends HTMLAttributes {
    name?: string | undefined;
    open?: Booleanish | undefined;
}
export interface DelHTMLAttributes extends HTMLAttributes {
    cite?: string | undefined;
    datetime?: string | undefined;
}
export interface DialogHTMLAttributes extends HTMLAttributes {
    open?: Booleanish | undefined;
    onClose?: ((payload: Event) => void) | undefined;
    onCancel?: ((payload: Event) => void) | undefined;
}
export interface EmbedHTMLAttributes extends HTMLAttributes {
    height?: Numberish | undefined;
    src?: string | undefined;
    type?: string | undefined;
    width?: Numberish | undefined;
}
export interface FieldsetHTMLAttributes extends HTMLAttributes {
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    name?: string | undefined;
}
export interface FormHTMLAttributes extends HTMLAttributes {
    acceptcharset?: string | undefined;
    action?: string | undefined;
    autocomplete?: string | undefined;
    enctype?: string | undefined;
    method?: string | undefined;
    name?: string | undefined;
    novalidate?: Booleanish | undefined;
    target?: string | undefined;
}
export interface HtmlHTMLAttributes extends HTMLAttributes {
    manifest?: string | undefined;
}
export interface IframeHTMLAttributes extends HTMLAttributes {
    allow?: string | undefined;
    allowfullscreen?: Booleanish | undefined;
    allowtransparency?: Booleanish | undefined;
    /** @deprecated */
    frameborder?: Numberish | undefined;
    height?: Numberish | undefined;
    loading?: 'eager' | 'lazy' | undefined;
    /** @deprecated */
    marginheight?: Numberish | undefined;
    /** @deprecated */
    marginwidth?: Numberish | undefined;
    name?: string | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
    sandbox?: string | undefined;
    /** @deprecated */
    scrolling?: string | undefined;
    seamless?: Booleanish | undefined;
    src?: string | undefined;
    srcdoc?: string | undefined;
    width?: Numberish | undefined;
}
export interface ImgHTMLAttributes extends HTMLAttributes {
    alt?: string | undefined;
    crossorigin?: 'anonymous' | 'use-credentials' | '' | undefined;
    decoding?: 'async' | 'auto' | 'sync' | undefined;
    fetchpriority?: 'high' | 'low' | 'auto' | undefined;
    height?: Numberish | undefined;
    loading?: 'eager' | 'lazy' | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcset?: string | undefined;
    usemap?: string | undefined;
    width?: Numberish | undefined;
}
export interface InsHTMLAttributes extends HTMLAttributes {
    cite?: string | undefined;
    datetime?: string | undefined;
}
export type InputTypeHTMLAttribute = 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' | (string & {});
export interface InputHTMLAttributes extends HTMLAttributes {
    accept?: string | undefined;
    alt?: string | undefined;
    autocomplete?: string | undefined;
    autofocus?: Booleanish | undefined;
    capture?: boolean | 'user' | 'environment' | undefined;
    checked?: Booleanish | any[] | Set<any> | undefined;
    crossorigin?: string | undefined;
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    formaction?: string | undefined;
    formenctype?: string | undefined;
    formmethod?: string | undefined;
    formnovalidate?: Booleanish | undefined;
    formtarget?: string | undefined;
    height?: Numberish | undefined;
    indeterminate?: boolean | undefined;
    list?: string | undefined;
    max?: Numberish | undefined;
    maxlength?: Numberish | undefined;
    min?: Numberish | undefined;
    minlength?: Numberish | undefined;
    multiple?: Booleanish | undefined;
    name?: string | undefined;
    pattern?: string | undefined;
    placeholder?: string | undefined;
    readonly?: Booleanish | undefined;
    required?: Booleanish | undefined;
    size?: Numberish | undefined;
    src?: string | undefined;
    step?: Numberish | undefined;
    type?: InputTypeHTMLAttribute | undefined;
    value?: any;
    width?: Numberish | undefined;
    onCancel?: ((payload: Event) => void) | undefined;
}
export interface KeygenHTMLAttributes extends HTMLAttributes {
    autofocus?: Booleanish | undefined;
    challenge?: string | undefined;
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    keytype?: string | undefined;
    keyparams?: string | undefined;
    name?: string | undefined;
}
export interface LabelHTMLAttributes extends HTMLAttributes {
    for?: string | undefined;
    form?: string | undefined;
}
export interface LiHTMLAttributes extends HTMLAttributes {
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface LinkHTMLAttributes extends HTMLAttributes {
    as?: string | undefined;
    crossorigin?: string | undefined;
    href?: string | undefined;
    hreflang?: string | undefined;
    integrity?: string | undefined;
    media?: string | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
    rel?: string | undefined;
    sizes?: string | undefined;
    type?: string | undefined;
    charset?: string | undefined;
}
export interface MapHTMLAttributes extends HTMLAttributes {
    name?: string | undefined;
}
export interface MenuHTMLAttributes extends HTMLAttributes {
    type?: string | undefined;
}
export interface MediaHTMLAttributes extends HTMLAttributes {
    autoplay?: Booleanish | undefined;
    controls?: Booleanish | undefined;
    controlslist?: string | undefined;
    crossorigin?: string | undefined;
    loop?: Booleanish | undefined;
    mediagroup?: string | undefined;
    muted?: Booleanish | undefined;
    playsinline?: Booleanish | undefined;
    preload?: string | undefined;
    src?: string | undefined;
}
export interface MetaHTMLAttributes extends HTMLAttributes {
    charset?: string | undefined;
    content?: string | undefined;
    httpequiv?: string | undefined;
    name?: string | undefined;
}
export interface MeterHTMLAttributes extends HTMLAttributes {
    form?: string | undefined;
    high?: Numberish | undefined;
    low?: Numberish | undefined;
    max?: Numberish | undefined;
    min?: Numberish | undefined;
    optimum?: Numberish | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface QuoteHTMLAttributes extends HTMLAttributes {
    cite?: string | undefined;
}
export interface ObjectHTMLAttributes extends HTMLAttributes {
    classid?: string | undefined;
    data?: string | undefined;
    form?: string | undefined;
    height?: Numberish | undefined;
    name?: string | undefined;
    type?: string | undefined;
    usemap?: string | undefined;
    width?: Numberish | undefined;
    wmode?: string | undefined;
}
export interface OlHTMLAttributes extends HTMLAttributes {
    reversed?: Booleanish | undefined;
    start?: Numberish | undefined;
    type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined;
}
export interface OptgroupHTMLAttributes extends HTMLAttributes {
    disabled?: Booleanish | undefined;
    label?: string | undefined;
}
export interface OptionHTMLAttributes extends HTMLAttributes {
    disabled?: Booleanish | undefined;
    label?: string | undefined;
    selected?: Booleanish | undefined;
    value?: any;
}
export interface OutputHTMLAttributes extends HTMLAttributes {
    for?: string | undefined;
    form?: string | undefined;
    name?: string | undefined;
}
export interface ParamHTMLAttributes extends HTMLAttributes {
    name?: string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface ProgressHTMLAttributes extends HTMLAttributes {
    max?: Numberish | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface ScriptHTMLAttributes extends HTMLAttributes {
    async?: Booleanish | undefined;
    /** @deprecated */
    charset?: string | undefined;
    crossorigin?: string | undefined;
    defer?: Booleanish | undefined;
    integrity?: string | undefined;
    nomodule?: Booleanish | undefined;
    referrerpolicy?: HTMLAttributeReferrerPolicy | undefined;
    nonce?: string | undefined;
    src?: string | undefined;
    type?: string | undefined;
}
export interface SelectHTMLAttributes extends HTMLAttributes {
    autocomplete?: string | undefined;
    autofocus?: Booleanish | undefined;
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    multiple?: Booleanish | undefined;
    name?: string | undefined;
    required?: Booleanish | undefined;
    size?: Numberish | undefined;
    value?: any;
}
export interface SourceHTMLAttributes extends HTMLAttributes {
    media?: string | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcset?: string | undefined;
    type?: string | undefined;
}
export interface StyleHTMLAttributes extends HTMLAttributes {
    media?: string | undefined;
    nonce?: string | undefined;
    scoped?: Booleanish | undefined;
    type?: string | undefined;
}
export interface TableHTMLAttributes extends HTMLAttributes {
    cellpadding?: Numberish | undefined;
    cellspacing?: Numberish | undefined;
    summary?: string | undefined;
    width?: Numberish | undefined;
}
export interface TextareaHTMLAttributes extends HTMLAttributes {
    autocomplete?: string | undefined;
    autofocus?: Booleanish | undefined;
    cols?: Numberish | undefined;
    dirname?: string | undefined;
    disabled?: Booleanish | undefined;
    form?: string | undefined;
    maxlength?: Numberish | undefined;
    minlength?: Numberish | undefined;
    name?: string | undefined;
    placeholder?: string | undefined;
    readonly?: Booleanish | undefined;
    required?: Booleanish | undefined;
    rows?: Numberish | undefined;
    value?: string | ReadonlyArray<string> | number | null | undefined;
    wrap?: string | undefined;
}
export interface TdHTMLAttributes extends HTMLAttributes {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
    colspan?: Numberish | undefined;
    headers?: string | undefined;
    rowspan?: Numberish | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
    height?: Numberish | undefined;
    width?: Numberish | undefined;
    valign?: 'top' | 'middle' | 'bottom' | 'baseline' | undefined;
}
export interface ThHTMLAttributes extends HTMLAttributes {
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
    colspan?: Numberish | undefined;
    headers?: string | undefined;
    rowspan?: Numberish | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
}
export interface TimeHTMLAttributes extends HTMLAttributes {
    datetime?: string | undefined;
}
export interface TrackHTMLAttributes extends HTMLAttributes {
    default?: Booleanish | undefined;
    kind?: string | undefined;
    label?: string | undefined;
    src?: string | undefined;
    srclang?: string | undefined;
}
export interface VideoHTMLAttributes extends MediaHTMLAttributes {
    height?: Numberish | undefined;
    playsinline?: Booleanish | undefined;
    poster?: string | undefined;
    width?: Numberish | undefined;
    disablePictureInPicture?: Booleanish | undefined;
    disableRemotePlayback?: Booleanish | undefined;
}
export interface WebViewHTMLAttributes extends HTMLAttributes {
    allowfullscreen?: Booleanish | undefined;
    allowpopups?: Booleanish | undefined;
    autoFocus?: Booleanish | undefined;
    autosize?: Booleanish | undefined;
    blinkfeatures?: string | undefined;
    disableblinkfeatures?: string | undefined;
    disableguestresize?: Booleanish | undefined;
    disablewebsecurity?: Booleanish | undefined;
    guestinstance?: string | undefined;
    httpreferrer?: string | undefined;
    nodeintegration?: Booleanish | undefined;
    partition?: string | undefined;
    plugins?: Booleanish | undefined;
    preload?: string | undefined;
    src?: string | undefined;
    useragent?: string | undefined;
    webpreferences?: string | undefined;
}
export interface SVGAttributes extends AriaAttributes, EventHandlers<Events> {
    innerHTML?: string | undefined;
    /**
     * SVG Styling Attributes
     * @see https://www.w3.org/TR/SVG/styling.html#ElementSpecificStyling
     */
    class?: any;
    style?: StyleValue | undefined;
    color?: string | undefined;
    height?: Numberish | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    max?: Numberish | undefined;
    media?: string | undefined;
    method?: string | undefined;
    min?: Numberish | undefined;
    name?: string | undefined;
    target?: string | undefined;
    type?: string | undefined;
    width?: Numberish | undefined;
    role?: string | undefined;
    tabindex?: Numberish | undefined;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
    'accent-height'?: Numberish | undefined;
    accumulate?: 'none' | 'sum' | undefined;
    additive?: 'replace' | 'sum' | undefined;
    'alignment-baseline'?: 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'inherit' | undefined;
    allowReorder?: 'no' | 'yes' | undefined;
    alphabetic?: Numberish | undefined;
    amplitude?: Numberish | undefined;
    'arabic-form'?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined;
    ascent?: Numberish | undefined;
    attributeName?: string | undefined;
    attributeType?: string | undefined;
    autoReverse?: Numberish | undefined;
    azimuth?: Numberish | undefined;
    baseFrequency?: Numberish | undefined;
    'baseline-shift'?: Numberish | undefined;
    baseProfile?: Numberish | undefined;
    bbox?: Numberish | undefined;
    begin?: Numberish | undefined;
    bias?: Numberish | undefined;
    by?: Numberish | undefined;
    calcMode?: Numberish | undefined;
    'cap-height'?: Numberish | undefined;
    clip?: Numberish | undefined;
    'clip-path'?: string | undefined;
    clipPathUnits?: Numberish | undefined;
    'clip-rule'?: Numberish | undefined;
    'color-interpolation'?: Numberish | undefined;
    'color-interpolation-filters'?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined;
    'color-profile'?: Numberish | undefined;
    'color-rendering'?: Numberish | undefined;
    contentScriptType?: Numberish | undefined;
    contentStyleType?: Numberish | undefined;
    cursor?: Numberish | undefined;
    cx?: Numberish | undefined;
    cy?: Numberish | undefined;
    d?: string | undefined;
    decelerate?: Numberish | undefined;
    descent?: Numberish | undefined;
    diffuseConstant?: Numberish | undefined;
    direction?: Numberish | undefined;
    display?: Numberish | undefined;
    divisor?: Numberish | undefined;
    'dominant-baseline'?: Numberish | undefined;
    dur?: Numberish | undefined;
    dx?: Numberish | undefined;
    dy?: Numberish | undefined;
    edgeMode?: Numberish | undefined;
    elevation?: Numberish | undefined;
    'enable-background'?: Numberish | undefined;
    end?: Numberish | undefined;
    exponent?: Numberish | undefined;
    externalResourcesRequired?: Numberish | undefined;
    fill?: string | undefined;
    'fill-opacity'?: Numberish | undefined;
    'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | undefined;
    filter?: string | undefined;
    filterRes?: Numberish | undefined;
    filterUnits?: Numberish | undefined;
    'flood-color'?: Numberish | undefined;
    'flood-opacity'?: Numberish | undefined;
    focusable?: Numberish | undefined;
    'font-family'?: string | undefined;
    'font-size'?: Numberish | undefined;
    'font-size-adjust'?: Numberish | undefined;
    'font-stretch'?: Numberish | undefined;
    'font-style'?: Numberish | undefined;
    'font-variant'?: Numberish | undefined;
    'font-weight'?: Numberish | undefined;
    format?: Numberish | undefined;
    from?: Numberish | undefined;
    fx?: Numberish | undefined;
    fy?: Numberish | undefined;
    g1?: Numberish | undefined;
    g2?: Numberish | undefined;
    'glyph-name'?: Numberish | undefined;
    'glyph-orientation-horizontal'?: Numberish | undefined;
    'glyph-orientation-vertical'?: Numberish | undefined;
    glyphRef?: Numberish | undefined;
    gradientTransform?: string | undefined;
    gradientUnits?: string | undefined;
    hanging?: Numberish | undefined;
    'horiz-adv-x'?: Numberish | undefined;
    'horiz-origin-x'?: Numberish | undefined;
    href?: string | undefined;
    ideographic?: Numberish | undefined;
    'image-rendering'?: Numberish | undefined;
    in2?: Numberish | undefined;
    in?: string | undefined;
    intercept?: Numberish | undefined;
    k1?: Numberish | undefined;
    k2?: Numberish | undefined;
    k3?: Numberish | undefined;
    k4?: Numberish | undefined;
    k?: Numberish | undefined;
    kernelMatrix?: Numberish | undefined;
    kernelUnitLength?: Numberish | undefined;
    kerning?: Numberish | undefined;
    keyPoints?: Numberish | undefined;
    keySplines?: Numberish | undefined;
    keyTimes?: Numberish | undefined;
    lengthAdjust?: Numberish | undefined;
    'letter-spacing'?: Numberish | undefined;
    'lighting-color'?: Numberish | undefined;
    limitingConeAngle?: Numberish | undefined;
    local?: Numberish | undefined;
    'marker-end'?: string | undefined;
    markerHeight?: Numberish | undefined;
    'marker-mid'?: string | undefined;
    'marker-start'?: string | undefined;
    markerUnits?: Numberish | undefined;
    markerWidth?: Numberish | undefined;
    mask?: string | undefined;
    maskContentUnits?: Numberish | undefined;
    maskUnits?: Numberish | undefined;
    mathematical?: Numberish | undefined;
    mode?: Numberish | undefined;
    numOctaves?: Numberish | undefined;
    offset?: Numberish | undefined;
    opacity?: Numberish | undefined;
    operator?: Numberish | undefined;
    order?: Numberish | undefined;
    orient?: Numberish | undefined;
    orientation?: Numberish | undefined;
    origin?: Numberish | undefined;
    overflow?: Numberish | undefined;
    'overline-position'?: Numberish | undefined;
    'overline-thickness'?: Numberish | undefined;
    'paint-order'?: Numberish | undefined;
    'panose-1'?: Numberish | undefined;
    pathLength?: Numberish | undefined;
    patternContentUnits?: string | undefined;
    patternTransform?: Numberish | undefined;
    patternUnits?: string | undefined;
    'pointer-events'?: Numberish | undefined;
    points?: string | undefined;
    pointsAtX?: Numberish | undefined;
    pointsAtY?: Numberish | undefined;
    pointsAtZ?: Numberish | undefined;
    preserveAlpha?: Numberish | undefined;
    preserveAspectRatio?: string | undefined;
    primitiveUnits?: Numberish | undefined;
    r?: Numberish | undefined;
    radius?: Numberish | undefined;
    refX?: Numberish | undefined;
    refY?: Numberish | undefined;
    renderingIntent?: Numberish | undefined;
    repeatCount?: Numberish | undefined;
    repeatDur?: Numberish | undefined;
    requiredExtensions?: Numberish | undefined;
    requiredFeatures?: Numberish | undefined;
    restart?: Numberish | undefined;
    result?: string | undefined;
    rotate?: Numberish | undefined;
    rx?: Numberish | undefined;
    ry?: Numberish | undefined;
    scale?: Numberish | undefined;
    seed?: Numberish | undefined;
    'shape-rendering'?: Numberish | undefined;
    slope?: Numberish | undefined;
    spacing?: Numberish | undefined;
    specularConstant?: Numberish | undefined;
    specularExponent?: Numberish | undefined;
    speed?: Numberish | undefined;
    spreadMethod?: string | undefined;
    startOffset?: Numberish | undefined;
    stdDeviation?: Numberish | undefined;
    stemh?: Numberish | undefined;
    stemv?: Numberish | undefined;
    stitchTiles?: Numberish | undefined;
    'stop-color'?: string | undefined;
    'stop-opacity'?: Numberish | undefined;
    'strikethrough-position'?: Numberish | undefined;
    'strikethrough-thickness'?: Numberish | undefined;
    string?: Numberish | undefined;
    stroke?: string | undefined;
    'stroke-dasharray'?: Numberish | undefined;
    'stroke-dashoffset'?: Numberish | undefined;
    'stroke-linecap'?: 'butt' | 'round' | 'square' | 'inherit' | undefined;
    'stroke-linejoin'?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined;
    'stroke-miterlimit'?: Numberish | undefined;
    'stroke-opacity'?: Numberish | undefined;
    'stroke-width'?: Numberish | undefined;
    surfaceScale?: Numberish | undefined;
    systemLanguage?: Numberish | undefined;
    tableValues?: Numberish | undefined;
    targetX?: Numberish | undefined;
    targetY?: Numberish | undefined;
    'text-anchor'?: string | undefined;
    'text-decoration'?: Numberish | undefined;
    textLength?: Numberish | undefined;
    'text-rendering'?: Numberish | undefined;
    to?: Numberish | undefined;
    transform?: string | undefined;
    u1?: Numberish | undefined;
    u2?: Numberish | undefined;
    'underline-position'?: Numberish | undefined;
    'underline-thickness'?: Numberish | undefined;
    unicode?: Numberish | undefined;
    'unicode-bidi'?: Numberish | undefined;
    'unicode-range'?: Numberish | undefined;
    'unitsPer-em'?: Numberish | undefined;
    'v-alphabetic'?: Numberish | undefined;
    values?: string | undefined;
    'vector-effect'?: Numberish | undefined;
    version?: string | undefined;
    'vert-adv-y'?: Numberish | undefined;
    'vert-origin-x'?: Numberish | undefined;
    'vert-origin-y'?: Numberish | undefined;
    'v-hanging'?: Numberish | undefined;
    'v-ideographic'?: Numberish | undefined;
    viewBox?: string | undefined;
    viewTarget?: Numberish | undefined;
    visibility?: Numberish | undefined;
    'v-mathematical'?: Numberish | undefined;
    widths?: Numberish | undefined;
    'word-spacing'?: Numberish | undefined;
    'writing-mode'?: Numberish | undefined;
    x1?: Numberish | undefined;
    x2?: Numberish | undefined;
    x?: Numberish | undefined;
    xChannelSelector?: string | undefined;
    'x-height'?: Numberish | undefined;
    xlinkActuate?: string | undefined;
    xlinkArcrole?: string | undefined;
    xlinkHref?: string | undefined;
    xlinkRole?: string | undefined;
    xlinkShow?: string | undefined;
    xlinkTitle?: string | undefined;
    xlinkType?: string | undefined;
    xmlns?: string | undefined;
    xmlnsXlink?: string | undefined;
    y1?: Numberish | undefined;
    y2?: Numberish | undefined;
    y?: Numberish | undefined;
    yChannelSelector?: string | undefined;
    z?: Numberish | undefined;
    zoomAndPan?: string | undefined;
}
export interface IntrinsicElementAttributes {
    a: AnchorHTMLAttributes;
    abbr: HTMLAttributes;
    address: HTMLAttributes;
    area: AreaHTMLAttributes;
    article: HTMLAttributes;
    aside: HTMLAttributes;
    audio: AudioHTMLAttributes;
    b: HTMLAttributes;
    base: BaseHTMLAttributes;
    bdi: HTMLAttributes;
    bdo: HTMLAttributes;
    blockquote: BlockquoteHTMLAttributes;
    body: HTMLAttributes;
    br: HTMLAttributes;
    button: ButtonHTMLAttributes;
    canvas: CanvasHTMLAttributes;
    caption: HTMLAttributes;
    cite: HTMLAttributes;
    code: HTMLAttributes;
    col: ColHTMLAttributes;
    colgroup: ColgroupHTMLAttributes;
    data: DataHTMLAttributes;
    datalist: HTMLAttributes;
    dd: HTMLAttributes;
    del: DelHTMLAttributes;
    details: DetailsHTMLAttributes;
    dfn: HTMLAttributes;
    dialog: DialogHTMLAttributes;
    div: HTMLAttributes;
    dl: HTMLAttributes;
    dt: HTMLAttributes;
    em: HTMLAttributes;
    embed: EmbedHTMLAttributes;
    fieldset: FieldsetHTMLAttributes;
    figcaption: HTMLAttributes;
    figure: HTMLAttributes;
    footer: HTMLAttributes;
    form: FormHTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;
    head: HTMLAttributes;
    header: HTMLAttributes;
    hgroup: HTMLAttributes;
    hr: HTMLAttributes;
    html: HtmlHTMLAttributes;
    i: HTMLAttributes;
    iframe: IframeHTMLAttributes;
    img: ImgHTMLAttributes;
    input: InputHTMLAttributes;
    ins: InsHTMLAttributes;
    kbd: HTMLAttributes;
    keygen: KeygenHTMLAttributes;
    label: LabelHTMLAttributes;
    legend: HTMLAttributes;
    li: LiHTMLAttributes;
    link: LinkHTMLAttributes;
    main: HTMLAttributes;
    map: MapHTMLAttributes;
    mark: HTMLAttributes;
    menu: MenuHTMLAttributes;
    meta: MetaHTMLAttributes;
    meter: MeterHTMLAttributes;
    nav: HTMLAttributes;
    noindex: HTMLAttributes;
    noscript: HTMLAttributes;
    object: ObjectHTMLAttributes;
    ol: OlHTMLAttributes;
    optgroup: OptgroupHTMLAttributes;
    option: OptionHTMLAttributes;
    output: OutputHTMLAttributes;
    p: HTMLAttributes;
    param: ParamHTMLAttributes;
    picture: HTMLAttributes;
    pre: HTMLAttributes;
    progress: ProgressHTMLAttributes;
    q: QuoteHTMLAttributes;
    rp: HTMLAttributes;
    rt: HTMLAttributes;
    ruby: HTMLAttributes;
    s: HTMLAttributes;
    samp: HTMLAttributes;
    script: ScriptHTMLAttributes;
    section: HTMLAttributes;
    select: SelectHTMLAttributes;
    small: HTMLAttributes;
    source: SourceHTMLAttributes;
    span: HTMLAttributes;
    strong: HTMLAttributes;
    style: StyleHTMLAttributes;
    sub: HTMLAttributes;
    summary: HTMLAttributes;
    sup: HTMLAttributes;
    table: TableHTMLAttributes;
    template: HTMLAttributes;
    tbody: HTMLAttributes;
    td: TdHTMLAttributes;
    textarea: TextareaHTMLAttributes;
    tfoot: HTMLAttributes;
    th: ThHTMLAttributes;
    thead: HTMLAttributes;
    time: TimeHTMLAttributes;
    title: HTMLAttributes;
    tr: HTMLAttributes;
    track: TrackHTMLAttributes;
    u: HTMLAttributes;
    ul: HTMLAttributes;
    var: HTMLAttributes;
    video: VideoHTMLAttributes;
    wbr: HTMLAttributes;
    webview: WebViewHTMLAttributes;
    svg: SVGAttributes;
    animate: SVGAttributes;
    animateMotion: SVGAttributes;
    animateTransform: SVGAttributes;
    circle: SVGAttributes;
    clipPath: SVGAttributes;
    defs: SVGAttributes;
    desc: SVGAttributes;
    ellipse: SVGAttributes;
    feBlend: SVGAttributes;
    feColorMatrix: SVGAttributes;
    feComponentTransfer: SVGAttributes;
    feComposite: SVGAttributes;
    feConvolveMatrix: SVGAttributes;
    feDiffuseLighting: SVGAttributes;
    feDisplacementMap: SVGAttributes;
    feDistantLight: SVGAttributes;
    feDropShadow: SVGAttributes;
    feFlood: SVGAttributes;
    feFuncA: SVGAttributes;
    feFuncB: SVGAttributes;
    feFuncG: SVGAttributes;
    feFuncR: SVGAttributes;
    feGaussianBlur: SVGAttributes;
    feImage: SVGAttributes;
    feMerge: SVGAttributes;
    feMergeNode: SVGAttributes;
    feMorphology: SVGAttributes;
    feOffset: SVGAttributes;
    fePointLight: SVGAttributes;
    feSpecularLighting: SVGAttributes;
    feSpotLight: SVGAttributes;
    feTile: SVGAttributes;
    feTurbulence: SVGAttributes;
    filter: SVGAttributes;
    foreignObject: SVGAttributes;
    g: SVGAttributes;
    image: SVGAttributes;
    line: SVGAttributes;
    linearGradient: SVGAttributes;
    marker: SVGAttributes;
    mask: SVGAttributes;
    metadata: SVGAttributes;
    mpath: SVGAttributes;
    path: SVGAttributes;
    pattern: SVGAttributes;
    polygon: SVGAttributes;
    polyline: SVGAttributes;
    radialGradient: SVGAttributes;
    rect: SVGAttributes;
    set: SVGAttributes;
    stop: SVGAttributes;
    switch: SVGAttributes;
    symbol: SVGAttributes;
    text: SVGAttributes;
    textPath: SVGAttributes;
    tspan: SVGAttributes;
    use: SVGAttributes;
    view: SVGAttributes;
}
export interface Events {
    onCopy: ClipboardEvent;
    onCut: ClipboardEvent;
    onPaste: ClipboardEvent;
    onCompositionend: CompositionEvent;
    onCompositionstart: CompositionEvent;
    onCompositionupdate: CompositionEvent;
    onDrag: DragEvent;
    onDragend: DragEvent;
    onDragenter: DragEvent;
    onDragexit: DragEvent;
    onDragleave: DragEvent;
    onDragover: DragEvent;
    onDragstart: DragEvent;
    onDrop: DragEvent;
    onFocus: FocusEvent;
    onFocusin: FocusEvent;
    onFocusout: FocusEvent;
    onBlur: FocusEvent;
    onChange: Event;
    onBeforeinput: InputEvent;
    onFormdata: FormDataEvent;
    onInput: InputEvent;
    onReset: Event;
    onSubmit: SubmitEvent;
    onInvalid: Event;
    onFullscreenchange: Event;
    onFullscreenerror: Event;
    onLoad: Event;
    onError: Event;
    onKeydown: KeyboardEvent;
    onKeypress: KeyboardEvent;
    onKeyup: KeyboardEvent;
    onDblclick: MouseEvent;
    onMousedown: MouseEvent;
    onMouseenter: MouseEvent;
    onMouseleave: MouseEvent;
    onMousemove: MouseEvent;
    onMouseout: MouseEvent;
    onMouseover: MouseEvent;
    onMouseup: MouseEvent;
    onAbort: UIEvent;
    onCanplay: Event;
    onCanplaythrough: Event;
    onDurationchange: Event;
    onEmptied: Event;
    onEncrypted: MediaEncryptedEvent;
    onEnded: Event;
    onLoadeddata: Event;
    onLoadedmetadata: Event;
    onLoadstart: Event;
    onPause: Event;
    onPlay: Event;
    onPlaying: Event;
    onProgress: ProgressEvent;
    onRatechange: Event;
    onSeeked: Event;
    onSeeking: Event;
    onStalled: Event;
    onSuspend: Event;
    onTimeupdate: Event;
    onVolumechange: Event;
    onWaiting: Event;
    onSelect: Event;
    onScroll: Event;
    onScrollend: Event;
    onTouchcancel: TouchEvent;
    onTouchend: TouchEvent;
    onTouchmove: TouchEvent;
    onTouchstart: TouchEvent;
    onAuxclick: PointerEvent;
    onClick: PointerEvent;
    onContextmenu: PointerEvent;
    onGotpointercapture: PointerEvent;
    onLostpointercapture: PointerEvent;
    onPointerdown: PointerEvent;
    onPointermove: PointerEvent;
    onPointerup: PointerEvent;
    onPointercancel: PointerEvent;
    onPointerenter: PointerEvent;
    onPointerleave: PointerEvent;
    onPointerover: PointerEvent;
    onPointerout: PointerEvent;
    onBeforetoggle: ToggleEvent;
    onToggle: ToggleEvent;
    onWheel: WheelEvent;
    onAnimationcancel: AnimationEvent;
    onAnimationstart: AnimationEvent;
    onAnimationend: AnimationEvent;
    onAnimationiteration: AnimationEvent;
    onSecuritypolicyviolation: SecurityPolicyViolationEvent;
    onTransitioncancel: TransitionEvent;
    onTransitionend: TransitionEvent;
    onTransitionrun: TransitionEvent;
    onTransitionstart: TransitionEvent;
}
type EventHandlers<E> = {
    [K in keyof E]?: E[K] extends (...args: any) => any ? E[K] : (payload: E[K]) => void;
};

export interface ReservedProps {
    key?: PropertyKey | undefined;
    ref?: VNodeRef | undefined;
    ref_for?: boolean | undefined;
    ref_key?: string | undefined;
}
export type NativeElements = {
    [K in keyof IntrinsicElementAttributes]: IntrinsicElementAttributes[K] & ReservedProps;
};

/**
 * This is a stub implementation to prevent the need to use dom types.
 *
 * To enable proper types, add \`"dom"\` to \`"lib"\` in your \`tsconfig.json\`.
 */
type DomType<T> = typeof globalThis extends {
    window: unknown;
} ? T : never;
declare module '@vue/reactivity' {
    interface RefUnwrapBailTypes {
        runtimeDOMBailTypes: DomType<Node | Window>;
    }
}
declare module '@vue/runtime-core' {
    interface GlobalComponents {
        Transition: DefineComponent<TransitionProps>;
        TransitionGroup: DefineComponent<TransitionGroupProps>;
    }
    interface GlobalDirectives {
        vShow: typeof vShow;
        vOn: VOnDirective;
        vBind: VModelDirective;
        vIf: Directive<any, boolean>;
        vOnce: Directive;
        vSlot: Directive;
    }
}
export declare const render: RootRenderFunction<Element | ShadowRoot>;
export declare const hydrate: RootHydrateFunction;
export declare const createApp: CreateAppFunction<Element>;
export declare const createSSRApp: CreateAppFunction<Element>;


`);

vueDtsMap.set('file:///node_modules/@vue/runtime-core/index.d.ts', `import { computed as computed\$1, Ref, OnCleanup, WatchStopHandle, ShallowUnwrapRef, UnwrapNestedRefs, DebuggerEvent, ComputedGetter, WritableComputedOptions, WatchCallback, ReactiveEffect, DebuggerOptions, WatchSource, WatchHandle, ReactiveMarker, WatchEffect, ShallowRef, WatchErrorCodes, reactive } from '@vue/reactivity';
export { ComputedGetter, ComputedRef, ComputedSetter, CustomRefFactory, DebuggerEvent, DebuggerEventExtraInfo, DebuggerOptions, DeepReadonly, EffectScheduler, EffectScope, MaybeRef, MaybeRefOrGetter, Raw, Reactive, ReactiveEffect, ReactiveEffectOptions, ReactiveEffectRunner, ReactiveFlags, Ref, ShallowReactive, ShallowRef, ShallowUnwrapRef, ToRef, ToRefs, TrackOpTypes, TriggerOpTypes, UnwrapNestedRefs, UnwrapRef, WatchCallback, WatchEffect, WatchHandle, WatchSource, WatchStopHandle, WritableComputedOptions, WritableComputedRef, customRef, effect, effectScope, getCurrentScope, getCurrentWatcher, isProxy, isReactive, isReadonly, isRef, isShallow, markRaw, onScopeDispose, onWatcherCleanup, proxyRefs, reactive, readonly, ref, shallowReactive, shallowReadonly, shallowRef, stop, toRaw, toRef, toRefs, toValue, triggerRef, unref } from '@vue/reactivity';
import { IfAny, Prettify, LooseRequired, UnionToIntersection, OverloadParameters, IsKeyValues } from '@vue/shared';
export { camelize, capitalize, normalizeClass, normalizeProps, normalizeStyle, toDisplayString, toHandlerKey } from '@vue/shared';

export declare const computed: typeof computed\$1;

export type Slot<T extends any = any> = (...args: IfAny<T, any[], [T] | (T extends undefined ? [] : never)>) => VNode[];
type InternalSlots = {
    [name: string]: Slot | undefined;
};
export type Slots = Readonly<InternalSlots>;
declare const SlotSymbol: unique symbol;
export type SlotsType<T extends Record<string, any> = Record<string, any>> = {
    [SlotSymbol]?: T;
};
type StrictUnwrapSlotsType<S extends SlotsType, T = NonNullable<S[typeof SlotSymbol]>> = [keyof S] extends [never] ? Slots : Readonly<T> & T;
type UnwrapSlotsType<S extends SlotsType, T = NonNullable<S[typeof SlotSymbol]>> = [keyof S] extends [never] ? Slots : Readonly<Prettify<{
    [K in keyof T]: NonNullable<T[K]> extends (...args: any[]) => any ? T[K] : Slot<T[K]>;
}>>;
type RawSlots = {
    [name: string]: unknown;
    \$stable?: boolean;
};

declare enum SchedulerJobFlags {
    QUEUED = 1,
    PRE = 2,
    /**
     * Indicates whether the effect is allowed to recursively trigger itself
     * when managed by the scheduler.
     *
     * By default, a job cannot trigger itself because some built-in method calls,
     * e.g. Array.prototype.push actually performs reads as well (#1740) which
     * can lead to confusing infinite loops.
     * The allowed cases are component update functions and watch callbacks.
     * Component update functions may update child component props, which in turn
     * trigger flush: "pre" watch callbacks that mutates state that the parent
     * relies on (#1801). Watch callbacks doesn't track its dependencies so if it
     * triggers itself again, it's likely intentional and it is the user's
     * responsibility to perform recursive state mutation that eventually
     * stabilizes (#1727).
     */
    ALLOW_RECURSE = 4,
    DISPOSED = 8
}
interface SchedulerJob extends Function {
    id?: number;
    /**
     * flags can technically be undefined, but it can still be used in bitwise
     * operations just like 0.
     */
    flags?: SchedulerJobFlags;
    /**
     * Attached by renderer.ts when setting up a component's render effect
     * Used to obtain component information when reporting max recursive updates.
     */
    i?: ComponentInternalInstance;
}
type SchedulerJobs = SchedulerJob | SchedulerJob[];
export declare function nextTick(): Promise<void>;
export declare function nextTick<T, R>(this: T, fn: (this: T) => R | Promise<R>): Promise<R>;
export declare function queuePostFlushCb(cb: SchedulerJobs): void;

export type ComponentPropsOptions<P = Data> = ComponentObjectPropsOptions<P> | string[];
export type ComponentObjectPropsOptions<P = Data> = {
    [K in keyof P]: Prop<P[K]> | null;
};
export type Prop<T, D = T> = PropOptions<T, D> | PropType<T>;
type DefaultFactory<T> = (props: Data) => T | null | undefined;
interface PropOptions<T = any, D = T> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: D | DefaultFactory<D> | null | undefined | object;
    validator?(value: unknown, props: Data): boolean;
}
export type PropType<T> = PropConstructor<T> | (PropConstructor<T> | null)[];
type PropConstructor<T = any> = {
    new (...args: any[]): T & {};
} | {
    (): T;
} | PropMethod<T>;
type PropMethod<T, TConstructor = any> = [T] extends [
    ((...args: any) => any) | undefined
] ? {
    new (): TConstructor;
    (): T;
    readonly prototype: TConstructor;
} : never;
type RequiredKeys<T> = {
    [K in keyof T]: T[K] extends {
        required: true;
    } | {
        default: any;
    } | BooleanConstructor | {
        type: BooleanConstructor;
    } ? T[K] extends {
        default: undefined | (() => undefined);
    } ? never : K : never;
}[keyof T];
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
type DefaultKeys<T> = {
    [K in keyof T]: T[K] extends {
        default: any;
    } | BooleanConstructor | {
        type: BooleanConstructor;
    } ? T[K] extends {
        type: BooleanConstructor;
        required: true;
    } ? never : K : never;
}[keyof T];
type InferPropType<T, NullAsAny = true> = [T] extends [null] ? NullAsAny extends true ? any : null : [T] extends [{
    type: null | true;
}] ? any : [T] extends [ObjectConstructor | {
    type: ObjectConstructor;
}] ? Record<string, any> : [T] extends [BooleanConstructor | {
    type: BooleanConstructor;
}] ? boolean : [T] extends [DateConstructor | {
    type: DateConstructor;
}] ? Date : [T] extends [(infer U)[] | {
    type: (infer U)[];
}] ? U extends DateConstructor ? Date | InferPropType<U, false> : InferPropType<U, false> : [T] extends [Prop<infer V, infer D>] ? unknown extends V ? keyof V extends never ? IfAny<V, V, D> : V : V : T;
/**
 * Extract prop types from a runtime props options object.
 * The extracted types are **internal** - i.e. the resolved props received by
 * the component.
 * - Boolean props are always present
 * - Props with default values are always present
 *
 * To extract accepted props from the parent, use {@link ExtractPublicPropTypes}.
 */
export type ExtractPropTypes<O> = {
    [K in keyof Pick<O, RequiredKeys<O>>]: O[K] extends {
        default: any;
    } ? Exclude<InferPropType<O[K]>, undefined> : InferPropType<O[K]>;
} & {
    [K in keyof Pick<O, OptionalKeys<O>>]?: InferPropType<O[K]>;
};
type PublicRequiredKeys<T> = {
    [K in keyof T]: T[K] extends {
        required: true;
    } ? K : never;
}[keyof T];
type PublicOptionalKeys<T> = Exclude<keyof T, PublicRequiredKeys<T>>;
/**
 * Extract prop types from a runtime props options object.
 * The extracted types are **public** - i.e. the expected props that can be
 * passed to component.
 */
export type ExtractPublicPropTypes<O> = {
    [K in keyof Pick<O, PublicRequiredKeys<O>>]: InferPropType<O[K]>;
} & {
    [K in keyof Pick<O, PublicOptionalKeys<O>>]?: InferPropType<O[K]>;
};
export type ExtractDefaultPropTypes<O> = O extends object ? {
    [K in keyof Pick<O, DefaultKeys<O>>]: InferPropType<O[K]>;
} : {};

/**
 * Vue \`<script setup>\` compiler macro for declaring component props. The
 * expected argument is the same as the component \`props\` option.
 *
 * Example runtime declaration:
 * \`\`\`js
 * // using Array syntax
 * const props = defineProps(['foo', 'bar'])
 * // using Object syntax
 * const props = defineProps({
 *   foo: String,
 *   bar: {
 *     type: Number,
 *     required: true
 *   }
 * })
 * \`\`\`
 *
 * Equivalent type-based declaration:
 * \`\`\`ts
 * // will be compiled into equivalent runtime declarations
 * const props = defineProps<{
 *   foo?: string
 *   bar: number
 * }>()
 * \`\`\`
 *
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits}
 *
 * This is only usable inside \`<script setup>\`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
export declare function defineProps<PropNames extends string = string>(props: PropNames[]): Prettify<Readonly<{
    [key in PropNames]?: any;
}>>;
export declare function defineProps<PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions>(props: PP): Prettify<Readonly<ExtractPropTypes<PP>>>;
export declare function defineProps<TypeProps>(): DefineProps<LooseRequired<TypeProps>, BooleanKey<TypeProps>>;
export type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
    readonly [K in BKeys]-?: boolean;
};
type BooleanKey<T, K extends keyof T = keyof T> = K extends any ? [T[K]] extends [boolean | undefined] ? K : never : never;
/**
 * Vue \`<script setup>\` compiler macro for declaring a component's emitted
 * events. The expected argument is the same as the component \`emits\` option.
 *
 * Example runtime declaration:
 * \`\`\`js
 * const emit = defineEmits(['change', 'update'])
 * \`\`\`
 *
 * Example type-based declaration:
 * \`\`\`ts
 * const emit = defineEmits<{
 *   // <eventName>: <expected arguments>
 *   change: []
 *   update: [value: number] // named tuple syntax
 * }>()
 *
 * emit('change')
 * emit('update', 1)
 * \`\`\`
 *
 * This is only usable inside \`<script setup>\`, is compiled away in the
 * output and should **not** be actually called at runtime.
 *
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits}
 */
export declare function defineEmits<EE extends string = string>(emitOptions: EE[]): EmitFn<EE[]>;
export declare function defineEmits<E extends EmitsOptions = EmitsOptions>(emitOptions: E): EmitFn<E>;
export declare function defineEmits<T extends ComponentTypeEmits>(): T extends (...args: any[]) => any ? T : ShortEmits<T>;
export type ComponentTypeEmits = ((...args: any[]) => any) | Record<string, any>;
type RecordToUnion<T extends Record<string, any>> = T[keyof T];
type ShortEmits<T extends Record<string, any>> = UnionToIntersection<RecordToUnion<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
}>>;
/**
 * Vue \`<script setup>\` compiler macro for declaring a component's exposed
 * instance properties when it is accessed by a parent component via template
 * refs.
 *
 * \`<script setup>\` components are closed by default - i.e. variables inside
 * the \`<script setup>\` scope is not exposed to parent unless explicitly exposed
 * via \`defineExpose\`.
 *
 * This is only usable inside \`<script setup>\`, is compiled away in the
 * output and should **not** be actually called at runtime.
 *
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineexpose}
 */
export declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): void;
/**
 * Vue \`<script setup>\` compiler macro for declaring a component's additional
 * options. This should be used only for options that cannot be expressed via
 * Composition API - e.g. \`inheritAttrs\`.
 *
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineoptions}
 */
export declare function defineOptions<RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(options?: ComponentOptionsBase<{}, RawBindings, D, C, M, Mixin, Extends, {}> & {
    /**
     * props should be defined via defineProps().
     */
    props?: never;
    /**
     * emits should be defined via defineEmits().
     */
    emits?: never;
    /**
     * expose should be defined via defineExpose().
     */
    expose?: never;
    /**
     * slots should be defined via defineSlots().
     */
    slots?: never;
}): void;
export declare function defineSlots<S extends Record<string, any> = Record<string, any>>(): StrictUnwrapSlotsType<SlotsType<S>>;
export type ModelRef<T, M extends PropertyKey = string, G = T, S = T> = Ref<G, S> & [
    ModelRef<T, M, G, S>,
    Record<M, true | undefined>
];
type DefineModelOptions<T = any, G = T, S = T> = {
    get?: (v: T) => G;
    set?: (v: S) => any;
};
/**
 * Vue \`<script setup>\` compiler macro for declaring a
 * two-way binding prop that can be consumed via \`v-model\` from the parent
 * component. This will declare a prop with the same name and a corresponding
 * \`update:propName\` event.
 *
 * If the first argument is a string, it will be used as the prop name;
 * Otherwise the prop name will default to "modelValue". In both cases, you
 * can also pass an additional object which will be used as the prop's options.
 *
 * The returned ref behaves differently depending on whether the parent
 * provided the corresponding v-model props or not:
 * - If yes, the returned ref's value will always be in sync with the parent
 *   prop.
 * - If not, the returned ref will behave like a normal local ref.
 *
 * @example
 * \`\`\`ts
 * // default model (consumed via \`v-model\`)
 * const modelValue = defineModel<string>()
 * modelValue.value = "hello"
 *
 * // default model with options
 * const modelValue = defineModel<string>({ required: true })
 *
 * // with specified name (consumed via \`v-model:count\`)
 * const count = defineModel<number>('count')
 * count.value++
 *
 * // with specified name and default value
 * const count = defineModel<number>('count', { default: 0 })
 * \`\`\`
 */
export declare function defineModel<T, M extends PropertyKey = string, G = T, S = T>(options: ({
    default: any;
} | {
    required: true;
}) & PropOptions<T> & DefineModelOptions<T, G, S>): ModelRef<T, M, G, S>;
export declare function defineModel<T, M extends PropertyKey = string, G = T, S = T>(options?: PropOptions<T> & DefineModelOptions<T, G, S>): ModelRef<T | undefined, M, G | undefined, S | undefined>;
export declare function defineModel<T, M extends PropertyKey = string, G = T, S = T>(name: string, options: ({
    default: any;
} | {
    required: true;
}) & PropOptions<T> & DefineModelOptions<T, G, S>): ModelRef<T, M, G, S>;
export declare function defineModel<T, M extends PropertyKey = string, G = T, S = T>(name: string, options?: PropOptions<T> & DefineModelOptions<T, G, S>): ModelRef<T | undefined, M, G | undefined, S | undefined>;
type NotUndefined<T> = T extends undefined ? never : T;
type MappedOmit<T, K extends keyof any> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};
type InferDefaults<T> = {
    [K in keyof T]?: InferDefault<T, T[K]>;
};
type NativeType = null | undefined | number | string | boolean | symbol | Function;
type InferDefault<P, T> = ((props: P) => T & {}) | (T extends NativeType ? T : never);
type PropsWithDefaults<T, Defaults extends InferDefaults<T>, BKeys extends keyof T> = T extends unknown ? Readonly<MappedOmit<T, keyof Defaults>> & {
    readonly [K in keyof Defaults as K extends keyof T ? K : never]-?: K extends keyof T ? Defaults[K] extends undefined ? IfAny<Defaults[K], NotUndefined<T[K]>, T[K]> : NotUndefined<T[K]> : never;
} & {
    readonly [K in BKeys]-?: K extends keyof Defaults ? Defaults[K] extends undefined ? boolean | undefined : boolean : boolean;
} : never;
/**
 * Vue \`<script setup>\` compiler macro for providing props default values when
 * using type-based \`defineProps\` declaration.
 *
 * Example usage:
 * \`\`\`ts
 * withDefaults(defineProps<{
 *   size?: number
 *   labels?: string[]
 * }>(), {
 *   size: 3,
 *   labels: () => ['default label']
 * })
 * \`\`\`
 *
 * This is only usable inside \`<script setup>\`, is compiled away in the output
 * and should **not** be actually called at runtime.
 *
 * @see {@link https://vuejs.org/guide/typescript/composition-api.html#typing-component-props}
 */
export declare function withDefaults<T, BKeys extends keyof T, Defaults extends InferDefaults<T>>(props: DefineProps<T, BKeys>, defaults: Defaults): PropsWithDefaults<T, Defaults, BKeys>;
export declare function useSlots(): SetupContext['slots'];
export declare function useAttrs(): SetupContext['attrs'];

export type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
export type EmitsOptions = ObjectEmitsOptions | string[];
export type EmitsToProps<T extends EmitsOptions | ComponentTypeEmits> = T extends string[] ? {
    [K in \`on\${Capitalize<T[number]>}\`]?: (...args: any[]) => any;
} : T extends ObjectEmitsOptions ? {
    [K in string & keyof T as \`on\${Capitalize<K>}\`]?: (...args: T[K] extends (...args: infer P) => any ? P : T[K] extends null ? any[] : never) => any;
} : {};
type TypeEmitsToOptions<T extends ComponentTypeEmits> = {
    [K in keyof T & string]: T[K] extends [...args: infer Args] ? (...args: Args) => any : () => any;
} & (T extends (...args: any[]) => any ? ParametersToFns<OverloadParameters<T>> : {});
type ParametersToFns<T extends any[]> = {
    [K in T[0]]: IsStringLiteral<K> extends true ? (...args: T extends [e: infer E, ...args: infer P] ? K extends E ? P : never : never) => any : never;
};
type IsStringLiteral<T> = T extends string ? string extends T ? false : true : false;
export type ShortEmitsToObject<E> = E extends Record<string, any[]> ? {
    [K in keyof E]: (...args: E[K]) => any;
} : E;
export type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> = Options extends Array<infer V> ? (event: V, ...args: any[]) => void : {} extends Options ? (event: string, ...args: any[]) => void : UnionToIntersection<{
    [key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => void : Options[key] extends any[] ? (event: key, ...args: Options[key]) => void : (event: key, ...args: any[]) => void;
}[Event]>;

/**
Runtime helper for applying directives to a vnode. Example usage:

const comp = resolveComponent('comp')
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h(comp), [
  [foo, this.x],
  [bar, this.y]
])
*/

export interface DirectiveBinding<Value = any, Modifiers extends string = string, Arg = any> {
    instance: ComponentPublicInstance | Record<string, any> | null;
    value: Value;
    oldValue: Value | null;
    arg?: Arg;
    modifiers: DirectiveModifiers<Modifiers>;
    dir: ObjectDirective<any, Value, Modifiers, Arg>;
}
export type DirectiveHook<HostElement = any, Prev = VNode<any, HostElement> | null, Value = any, Modifiers extends string = string, Arg = any> = (el: HostElement, binding: DirectiveBinding<Value, Modifiers, Arg>, vnode: VNode<any, HostElement>, prevVNode: Prev) => void;
type SSRDirectiveHook<Value = any, Modifiers extends string = string, Arg = any> = (binding: DirectiveBinding<Value, Modifiers, Arg>, vnode: VNode) => Data | undefined;
export interface ObjectDirective<HostElement = any, Value = any, Modifiers extends string = string, Arg = any> {
    created?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    beforeMount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    mounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    beforeUpdate?: DirectiveHook<HostElement, VNode<any, HostElement>, Value, Modifiers, Arg>;
    updated?: DirectiveHook<HostElement, VNode<any, HostElement>, Value, Modifiers, Arg>;
    beforeUnmount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    unmounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>;
    getSSRProps?: SSRDirectiveHook<Value, Modifiers, Arg>;
    deep?: boolean;
}
export type FunctionDirective<HostElement = any, V = any, Modifiers extends string = string, Arg = any> = DirectiveHook<HostElement, any, V, Modifiers, Arg>;
export type Directive<HostElement = any, Value = any, Modifiers extends string = string, Arg = any> = ObjectDirective<HostElement, Value, Modifiers, Arg> | FunctionDirective<HostElement, Value, Modifiers, Arg>;
type DirectiveModifiers<K extends string = string> = Partial<Record<K, boolean>>;
export type DirectiveArguments = Array<[Directive | undefined] | [Directive | undefined, any] | [Directive | undefined, any, any] | [Directive | undefined, any, any, DirectiveModifiers]>;
/**
 * Adds directives to a VNode.
 */
export declare function withDirectives<T extends VNode>(vnode: T, directives: DirectiveArguments): T;

/**
 * Custom properties added to component instances in any way and can be accessed through \`this\`
 *
 * @example
 * Here is an example of adding a property \`\$router\` to every component instance:
 * \`\`\`ts
 * import { createApp } from 'vue'
 * import { Router, createRouter } from 'vue-router'
 *
 * declare module 'vue' {
 *   interface ComponentCustomProperties {
 *     \$router: Router
 *   }
 * }
 *
 * // effectively adding the router to every component instance
 * const app = createApp({})
 * const router = createRouter()
 * app.config.globalProperties.\$router = router
 *
 * const vm = app.mount('#app')
 * // we can access the router from the instance
 * vm.\$router.push('/')
 * \`\`\`
 */
export interface ComponentCustomProperties {
}
type IsDefaultMixinComponent<T> = T extends ComponentOptionsMixin ? ComponentOptionsMixin extends T ? true : false : false;
type MixinToOptionTypes<T> = T extends ComponentOptionsBase<infer P, infer B, infer D, infer C, infer M, infer Mixin, infer Extends, any, any, infer Defaults, any, any, any, any, any, any, any> ? OptionTypesType<P & {}, B & {}, D & {}, C & {}, M & {}, Defaults & {}> & IntersectionMixin<Mixin> & IntersectionMixin<Extends> : never;
type ExtractMixin<T> = {
    Mixin: MixinToOptionTypes<T>;
}[T extends ComponentOptionsMixin ? 'Mixin' : never];
type IntersectionMixin<T> = IsDefaultMixinComponent<T> extends true ? OptionTypesType : UnionToIntersection<ExtractMixin<T>>;
type UnwrapMixinsType<T, Type extends OptionTypesKeys> = T extends OptionTypesType ? T[Type] : never;
type EnsureNonVoid<T> = T extends void ? {} : T;
type ComponentPublicInstanceConstructor<T extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any>, Props = any, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions> = {
    __isFragment?: never;
    __isTeleport?: never;
    __isSuspense?: never;
    new (...args: any[]): T;
};
/**
 * @deprecated This is no longer used internally, but exported and relied on by
 * existing library types generated by vue-tsc.
 */
export type CreateComponentPublicInstance<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, PublicProps = P, Defaults = {}, MakeDefaultsOptional extends boolean = false, I extends ComponentInjectOptions = {}, S extends SlotsType = {}, PublicMixin = IntersectionMixin<Mixin> & IntersectionMixin<Extends>, PublicP = UnwrapMixinsType<PublicMixin, 'P'> & EnsureNonVoid<P>, PublicB = UnwrapMixinsType<PublicMixin, 'B'> & EnsureNonVoid<B>, PublicD = UnwrapMixinsType<PublicMixin, 'D'> & EnsureNonVoid<D>, PublicC extends ComputedOptions = UnwrapMixinsType<PublicMixin, 'C'> & EnsureNonVoid<C>, PublicM extends MethodOptions = UnwrapMixinsType<PublicMixin, 'M'> & EnsureNonVoid<M>, PublicDefaults = UnwrapMixinsType<PublicMixin, 'Defaults'> & EnsureNonVoid<Defaults>> = ComponentPublicInstance<PublicP, PublicB, PublicD, PublicC, PublicM, E, PublicProps, PublicDefaults, MakeDefaultsOptional, ComponentOptionsBase<P, B, D, C, M, Mixin, Extends, E, string, Defaults, {}, string, S>, I, S>;
/**
 * This is the same as \`CreateComponentPublicInstance\` but adds local components,
 * global directives, exposed, and provide inference.
 * It changes the arguments order so that we don't need to repeat mixin
 * inference everywhere internally, but it has to be a new type to avoid
 * breaking types that relies on previous arguments order (#10842)
 */
export type CreateComponentPublicInstanceWithMixins<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, PublicProps = P, Defaults = {}, MakeDefaultsOptional extends boolean = false, I extends ComponentInjectOptions = {}, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, TypeRefs extends Data = {}, TypeEl extends Element = any, Provide extends ComponentProvideOptions = ComponentProvideOptions, PublicMixin = IntersectionMixin<Mixin> & IntersectionMixin<Extends>, PublicP = UnwrapMixinsType<PublicMixin, 'P'> & EnsureNonVoid<P>, PublicB = UnwrapMixinsType<PublicMixin, 'B'> & EnsureNonVoid<B>, PublicD = UnwrapMixinsType<PublicMixin, 'D'> & EnsureNonVoid<D>, PublicC extends ComputedOptions = UnwrapMixinsType<PublicMixin, 'C'> & EnsureNonVoid<C>, PublicM extends MethodOptions = UnwrapMixinsType<PublicMixin, 'M'> & EnsureNonVoid<M>, PublicDefaults = UnwrapMixinsType<PublicMixin, 'Defaults'> & EnsureNonVoid<Defaults>> = ComponentPublicInstance<PublicP, PublicB, PublicD, PublicC, PublicM, E, PublicProps, PublicDefaults, MakeDefaultsOptional, ComponentOptionsBase<P, B, D, C, M, Mixin, Extends, E, string, Defaults, {}, string, S, LC, Directives, Exposed, Provide>, I, S, Exposed, TypeRefs, TypeEl>;
type ExposedKeys<T, Exposed extends string & keyof T> = '' extends Exposed ? T : Pick<T, Exposed>;
export type ComponentPublicInstance<P = {}, // props type extracted from props option
B = {}, // raw bindings returned from setup()
D = {}, // return from data()
C extends ComputedOptions = {}, M extends MethodOptions = {}, E extends EmitsOptions = {}, PublicProps = {}, Defaults = {}, MakeDefaultsOptional extends boolean = false, Options = ComponentOptionsBase<any, any, any, any, any, any, any, any, any>, I extends ComponentInjectOptions = {}, S extends SlotsType = {}, Exposed extends string = '', TypeRefs extends Data = {}, TypeEl extends Element = any> = {
    \$: ComponentInternalInstance;
    \$data: D;
    \$props: MakeDefaultsOptional extends true ? Partial<Defaults> & Omit<Prettify<P> & PublicProps, keyof Defaults> : Prettify<P> & PublicProps;
    \$attrs: Data;
    \$refs: Data & TypeRefs;
    \$slots: UnwrapSlotsType<S>;
    \$root: ComponentPublicInstance | null;
    \$parent: ComponentPublicInstance | null;
    \$host: Element | null;
    \$emit: EmitFn<E>;
    \$el: TypeEl;
    \$options: Options & MergedComponentOptionsOverride;
    \$forceUpdate: () => void;
    \$nextTick: typeof nextTick;
    \$watch<T extends string | ((...args: any) => any)>(source: T, cb: T extends (...args: any) => infer R ? (...args: [R, R, OnCleanup]) => any : (...args: [any, any, OnCleanup]) => any, options?: WatchOptions): WatchStopHandle;
} & ExposedKeys<IfAny<P, P, Readonly<Defaults> & Omit<P, keyof ShallowUnwrapRef<B> | keyof Defaults>> & ShallowUnwrapRef<B> & UnwrapNestedRefs<D> & ExtractComputedReturns<C> & M & ComponentCustomProperties & InjectToObject<I>, Exposed>;

declare enum LifecycleHooks {
    BEFORE_CREATE = "bc",
    CREATED = "c",
    BEFORE_MOUNT = "bm",
    MOUNTED = "m",
    BEFORE_UPDATE = "bu",
    UPDATED = "u",
    BEFORE_UNMOUNT = "bum",
    UNMOUNTED = "um",
    DEACTIVATED = "da",
    ACTIVATED = "a",
    RENDER_TRIGGERED = "rtg",
    RENDER_TRACKED = "rtc",
    ERROR_CAPTURED = "ec",
    SERVER_PREFETCH = "sp"
}

export interface SuspenseProps {
    onResolve?: () => void;
    onPending?: () => void;
    onFallback?: () => void;
    timeout?: string | number;
    /**
     * Allow suspense to be captured by parent suspense
     *
     * @default false
     */
    suspensible?: boolean;
}
declare const SuspenseImpl: {
    name: string;
    __isSuspense: boolean;
    process(n1: VNode | null, n2: VNode, container: RendererElement, anchor: RendererNode | null, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null, optimized: boolean, rendererInternals: RendererInternals): void;
    hydrate: typeof hydrateSuspense;
    normalize: typeof normalizeSuspenseChildren;
};
export declare const Suspense: {
    __isSuspense: true;
    new (): {
        \$props: VNodeProps & SuspenseProps;
        \$slots: {
            default(): VNode[];
            fallback(): VNode[];
        };
    };
};
export interface SuspenseBoundary {
    vnode: VNode<RendererNode, RendererElement, SuspenseProps>;
    parent: SuspenseBoundary | null;
    parentComponent: ComponentInternalInstance | null;
    namespace: ElementNamespace;
    container: RendererElement;
    hiddenContainer: RendererElement;
    activeBranch: VNode | null;
    pendingBranch: VNode | null;
    deps: number;
    pendingId: number;
    timeout: number;
    isInFallback: boolean;
    isHydrating: boolean;
    isUnmounted: boolean;
    effects: Function[];
    resolve(force?: boolean, sync?: boolean): void;
    fallback(fallbackVNode: VNode): void;
    move(container: RendererElement, anchor: RendererNode | null, type: MoveType): void;
    next(): RendererNode | null;
    registerDep(instance: ComponentInternalInstance, setupRenderEffect: SetupRenderEffectFn, optimized: boolean): void;
    unmount(parentSuspense: SuspenseBoundary | null, doRemove?: boolean): void;
}
declare function hydrateSuspense(node: Node, vnode: VNode, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null, optimized: boolean, rendererInternals: RendererInternals, hydrateNode: (node: Node, vnode: VNode, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, slotScopeIds: string[] | null, optimized: boolean) => Node | null): Node | null;
declare function normalizeSuspenseChildren(vnode: VNode): void;

export type RootHydrateFunction = (vnode: VNode<Node, Element>, container: (Element | ShadowRoot) & {
    _vnode?: VNode;
}) => void;

type Hook<T = () => void> = T | T[];
export interface BaseTransitionProps<HostElement = RendererElement> {
    mode?: 'in-out' | 'out-in' | 'default';
    appear?: boolean;
    persisted?: boolean;
    onBeforeEnter?: Hook<(el: HostElement) => void>;
    onEnter?: Hook<(el: HostElement, done: () => void) => void>;
    onAfterEnter?: Hook<(el: HostElement) => void>;
    onEnterCancelled?: Hook<(el: HostElement) => void>;
    onBeforeLeave?: Hook<(el: HostElement) => void>;
    onLeave?: Hook<(el: HostElement, done: () => void) => void>;
    onAfterLeave?: Hook<(el: HostElement) => void>;
    onLeaveCancelled?: Hook<(el: HostElement) => void>;
    onBeforeAppear?: Hook<(el: HostElement) => void>;
    onAppear?: Hook<(el: HostElement, done: () => void) => void>;
    onAfterAppear?: Hook<(el: HostElement) => void>;
    onAppearCancelled?: Hook<(el: HostElement) => void>;
}
export interface TransitionHooks<HostElement = RendererElement> {
    mode: BaseTransitionProps['mode'];
    persisted: boolean;
    beforeEnter(el: HostElement): void;
    enter(el: HostElement): void;
    leave(el: HostElement, remove: () => void): void;
    clone(vnode: VNode): TransitionHooks<HostElement>;
    afterLeave?(): void;
    delayLeave?(el: HostElement, earlyRemove: () => void, delayedLeave: () => void): void;
    delayedLeave?(): void;
}
export interface TransitionState {
    isMounted: boolean;
    isLeaving: boolean;
    isUnmounting: boolean;
    leavingVNodes: Map<any, Record<string, VNode>>;
}
export declare function useTransitionState(): TransitionState;
export declare const BaseTransitionPropsValidators: Record<string, any>;
export declare const BaseTransition: {
    new (): {
        \$props: BaseTransitionProps<any>;
        \$slots: {
            default(): VNode[];
        };
    };
};
export declare function resolveTransitionHooks(vnode: VNode, props: BaseTransitionProps<any>, state: TransitionState, instance: ComponentInternalInstance, postClone?: (hooks: TransitionHooks) => void): TransitionHooks;
export declare function setTransitionHooks(vnode: VNode, hooks: TransitionHooks): void;
export declare function getTransitionRawChildren(children: VNode[], keepComment?: boolean, parentKey?: VNode['key']): VNode[];

export interface Renderer<HostElement = RendererElement> {
    render: RootRenderFunction<HostElement>;
    createApp: CreateAppFunction<HostElement>;
}
export interface HydrationRenderer extends Renderer<Element | ShadowRoot> {
    hydrate: RootHydrateFunction;
}
export type ElementNamespace = 'svg' | 'mathml' | undefined;
export type RootRenderFunction<HostElement = RendererElement> = (vnode: VNode | null, container: HostElement, namespace?: ElementNamespace) => void;
export interface RendererOptions<HostNode = RendererNode, HostElement = RendererElement> {
    patchProp(el: HostElement, key: string, prevValue: any, nextValue: any, namespace?: ElementNamespace, parentComponent?: ComponentInternalInstance | null): void;
    insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void;
    remove(el: HostNode): void;
    createElement(type: string, namespace?: ElementNamespace, isCustomizedBuiltIn?: string, vnodeProps?: (VNodeProps & {
        [key: string]: any;
    }) | null): HostElement;
    createText(text: string): HostNode;
    createComment(text: string): HostNode;
    setText(node: HostNode, text: string): void;
    setElementText(node: HostElement, text: string): void;
    parentNode(node: HostNode): HostElement | null;
    nextSibling(node: HostNode): HostNode | null;
    querySelector?(selector: string): HostElement | null;
    setScopeId?(el: HostElement, id: string): void;
    cloneNode?(node: HostNode): HostNode;
    insertStaticContent?(content: string, parent: HostElement, anchor: HostNode | null, namespace: ElementNamespace, start?: HostNode | null, end?: HostNode | null): [HostNode, HostNode];
}
export interface RendererNode {
    [key: string | symbol]: any;
}
export interface RendererElement extends RendererNode {
}
interface RendererInternals<HostNode = RendererNode, HostElement = RendererElement> {
    p: PatchFn;
    um: UnmountFn;
    r: RemoveFn;
    m: MoveFn;
    mt: MountComponentFn;
    mc: MountChildrenFn;
    pc: PatchChildrenFn;
    pbc: PatchBlockChildrenFn;
    n: NextFn;
    o: RendererOptions<HostNode, HostElement>;
}
type PatchFn = (n1: VNode | null, // null means this is a mount
n2: VNode, container: RendererElement, anchor?: RendererNode | null, parentComponent?: ComponentInternalInstance | null, parentSuspense?: SuspenseBoundary | null, namespace?: ElementNamespace, slotScopeIds?: string[] | null, optimized?: boolean) => void;
type MountChildrenFn = (children: VNodeArrayChildren, container: RendererElement, anchor: RendererNode | null, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null, optimized: boolean, start?: number) => void;
type PatchChildrenFn = (n1: VNode | null, n2: VNode, container: RendererElement, anchor: RendererNode | null, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null, optimized: boolean) => void;
type PatchBlockChildrenFn = (oldChildren: VNode[], newChildren: VNode[], fallbackContainer: RendererElement, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null) => void;
type MoveFn = (vnode: VNode, container: RendererElement, anchor: RendererNode | null, type: MoveType, parentSuspense?: SuspenseBoundary | null) => void;
type NextFn = (vnode: VNode) => RendererNode | null;
type UnmountFn = (vnode: VNode, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, doRemove?: boolean, optimized?: boolean) => void;
type RemoveFn = (vnode: VNode) => void;
type MountComponentFn = (initialVNode: VNode, container: RendererElement, anchor: RendererNode | null, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, optimized: boolean) => void;
type SetupRenderEffectFn = (instance: ComponentInternalInstance, initialVNode: VNode, container: RendererElement, anchor: RendererNode | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, optimized: boolean) => void;
declare enum MoveType {
    ENTER = 0,
    LEAVE = 1,
    REORDER = 2
}
/**
 * The createRenderer function accepts two generic arguments:
 * HostNode and HostElement, corresponding to Node and Element types in the
 * host environment. For example, for runtime-dom, HostNode would be the DOM
 * \`Node\` interface and HostElement would be the DOM \`Element\` interface.
 *
 * Custom renderers can pass in the platform specific types like this:
 *
 * \`\`\` js
 * const { render, createApp } = createRenderer<Node, Element>({
 *   patchProp,
 *   ...nodeOps
 * })
 * \`\`\`
 */
export declare function createRenderer<HostNode = RendererNode, HostElement = RendererElement>(options: RendererOptions<HostNode, HostElement>): Renderer<HostElement>;
export declare function createHydrationRenderer(options: RendererOptions<Node, Element>): HydrationRenderer;

type MatchPattern = string | RegExp | (string | RegExp)[];
export interface KeepAliveProps {
    include?: MatchPattern;
    exclude?: MatchPattern;
    max?: number | string;
}
export declare const KeepAlive: {
    __isKeepAlive: true;
    new (): {
        \$props: VNodeProps & KeepAliveProps;
        \$slots: {
            default(): VNode[];
        };
    };
};
export declare function onActivated(hook: Function, target?: ComponentInternalInstance | null): void;
export declare function onDeactivated(hook: Function, target?: ComponentInternalInstance | null): void;

type CreateHook<T = any> = (hook: T, target?: ComponentInternalInstance | null) => void;
export declare const onBeforeMount: CreateHook;
export declare const onMounted: CreateHook;
export declare const onBeforeUpdate: CreateHook;
export declare const onUpdated: CreateHook;
export declare const onBeforeUnmount: CreateHook;
export declare const onUnmounted: CreateHook;
export declare const onServerPrefetch: CreateHook;
type DebuggerHook = (e: DebuggerEvent) => void;
export declare const onRenderTriggered: CreateHook<DebuggerHook>;
export declare const onRenderTracked: CreateHook<DebuggerHook>;
type ErrorCapturedHook<TError = unknown> = (err: TError, instance: ComponentPublicInstance | null, info: string) => boolean | void;
export declare function onErrorCaptured<TError = Error>(hook: ErrorCapturedHook<TError>, target?: ComponentInternalInstance | null): void;

declare enum DeprecationTypes\$1 {
    GLOBAL_MOUNT = "GLOBAL_MOUNT",
    GLOBAL_MOUNT_CONTAINER = "GLOBAL_MOUNT_CONTAINER",
    GLOBAL_EXTEND = "GLOBAL_EXTEND",
    GLOBAL_PROTOTYPE = "GLOBAL_PROTOTYPE",
    GLOBAL_SET = "GLOBAL_SET",
    GLOBAL_DELETE = "GLOBAL_DELETE",
    GLOBAL_OBSERVABLE = "GLOBAL_OBSERVABLE",
    GLOBAL_PRIVATE_UTIL = "GLOBAL_PRIVATE_UTIL",
    CONFIG_SILENT = "CONFIG_SILENT",
    CONFIG_DEVTOOLS = "CONFIG_DEVTOOLS",
    CONFIG_KEY_CODES = "CONFIG_KEY_CODES",
    CONFIG_PRODUCTION_TIP = "CONFIG_PRODUCTION_TIP",
    CONFIG_IGNORED_ELEMENTS = "CONFIG_IGNORED_ELEMENTS",
    CONFIG_WHITESPACE = "CONFIG_WHITESPACE",
    CONFIG_OPTION_MERGE_STRATS = "CONFIG_OPTION_MERGE_STRATS",
    INSTANCE_SET = "INSTANCE_SET",
    INSTANCE_DELETE = "INSTANCE_DELETE",
    INSTANCE_DESTROY = "INSTANCE_DESTROY",
    INSTANCE_EVENT_EMITTER = "INSTANCE_EVENT_EMITTER",
    INSTANCE_EVENT_HOOKS = "INSTANCE_EVENT_HOOKS",
    INSTANCE_CHILDREN = "INSTANCE_CHILDREN",
    INSTANCE_LISTENERS = "INSTANCE_LISTENERS",
    INSTANCE_SCOPED_SLOTS = "INSTANCE_SCOPED_SLOTS",
    INSTANCE_ATTRS_CLASS_STYLE = "INSTANCE_ATTRS_CLASS_STYLE",
    OPTIONS_DATA_FN = "OPTIONS_DATA_FN",
    OPTIONS_DATA_MERGE = "OPTIONS_DATA_MERGE",
    OPTIONS_BEFORE_DESTROY = "OPTIONS_BEFORE_DESTROY",
    OPTIONS_DESTROYED = "OPTIONS_DESTROYED",
    WATCH_ARRAY = "WATCH_ARRAY",
    PROPS_DEFAULT_THIS = "PROPS_DEFAULT_THIS",
    V_ON_KEYCODE_MODIFIER = "V_ON_KEYCODE_MODIFIER",
    CUSTOM_DIR = "CUSTOM_DIR",
    ATTR_FALSE_VALUE = "ATTR_FALSE_VALUE",
    ATTR_ENUMERATED_COERCION = "ATTR_ENUMERATED_COERCION",
    TRANSITION_CLASSES = "TRANSITION_CLASSES",
    TRANSITION_GROUP_ROOT = "TRANSITION_GROUP_ROOT",
    COMPONENT_ASYNC = "COMPONENT_ASYNC",
    COMPONENT_FUNCTIONAL = "COMPONENT_FUNCTIONAL",
    COMPONENT_V_MODEL = "COMPONENT_V_MODEL",
    RENDER_FUNCTION = "RENDER_FUNCTION",
    FILTERS = "FILTERS",
    PRIVATE_APIS = "PRIVATE_APIS"
}
type CompatConfig = Partial<Record<DeprecationTypes\$1, boolean | 'suppress-warning'>> & {
    MODE?: 2 | 3 | ((comp: Component | null) => 2 | 3);
};
declare function configureCompat(config: CompatConfig): void;

/**
 * Interface for declaring custom options.
 *
 * @example
 * \`\`\`ts
 * declare module 'vue' {
 *   interface ComponentCustomOptions {
 *     beforeRouteUpdate?(
 *       to: Route,
 *       from: Route,
 *       next: () => void
 *     ): void
 *   }
 * }
 * \`\`\`
 */
export interface ComponentCustomOptions {
}
export type RenderFunction = () => VNodeChild;
export interface ComponentOptionsBase<Props, RawBindings, D, C extends ComputedOptions, M extends MethodOptions, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin, E extends EmitsOptions, EE extends string = string, Defaults = {}, I extends ComponentInjectOptions = {}, II extends string = string, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions> extends LegacyOptions<Props, D, C, M, Mixin, Extends, I, II, Provide>, ComponentInternalOptions, ComponentCustomOptions {
    setup?: (this: void, props: LooseRequired<Props & Prettify<UnwrapMixinsType<IntersectionMixin<Mixin> & IntersectionMixin<Extends>, 'P'>>>, ctx: SetupContext<E, S>) => Promise<RawBindings> | RawBindings | RenderFunction | void;
    name?: string;
    template?: string | object;
    render?: Function;
    components?: LC & Record<string, Component>;
    directives?: Directives & Record<string, Directive>;
    inheritAttrs?: boolean;
    emits?: (E | EE[]) & ThisType<void>;
    slots?: S;
    expose?: Exposed[];
    serverPrefetch?(): void | Promise<any>;
    compilerOptions?: RuntimeCompilerOptions;
    call?: (this: unknown, ...args: unknown[]) => never;
    __isFragment?: never;
    __isTeleport?: never;
    __isSuspense?: never;
    __defaults?: Defaults;
}
/**
 * Subset of compiler options that makes sense for the runtime.
 */
export interface RuntimeCompilerOptions {
    isCustomElement?: (tag: string) => boolean;
    whitespace?: 'preserve' | 'condense';
    comments?: boolean;
    delimiters?: [string, string];
}
export type ComponentOptions<Props = {}, RawBindings = any, D = any, C extends ComputedOptions = any, M extends MethodOptions = any, Mixin extends ComponentOptionsMixin = any, Extends extends ComponentOptionsMixin = any, E extends EmitsOptions = any, EE extends string = string, Defaults = {}, I extends ComponentInjectOptions = {}, II extends string = string, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions> = ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, Defaults, I, II, S, LC, Directives, Exposed, Provide> & ThisType<CreateComponentPublicInstanceWithMixins<{}, RawBindings, D, C, M, Mixin, Extends, E, Readonly<Props>, Defaults, false, I, S, LC, Directives>>;
export type ComponentOptionsMixin = ComponentOptionsBase<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
export type ComputedOptions = Record<string, ComputedGetter<any> | WritableComputedOptions<any>>;
export interface MethodOptions {
    [key: string]: Function;
}
type ExtractComputedReturns<T extends any> = {
    [key in keyof T]: T[key] extends {
        get: (...args: any[]) => infer TReturn;
    } ? TReturn : T[key] extends (...args: any[]) => infer TReturn ? TReturn : never;
};
type ObjectWatchOptionItem = {
    handler: WatchCallback | string;
} & WatchOptions;
type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem;
type ComponentWatchOptionItem = WatchOptionItem | WatchOptionItem[];
type ComponentWatchOptions = Record<string, ComponentWatchOptionItem>;
export type ComponentProvideOptions = ObjectProvideOptions | Function;
type ObjectProvideOptions = Record<string | symbol, unknown>;
export type ComponentInjectOptions = string[] | ObjectInjectOptions;
type ObjectInjectOptions = Record<string | symbol, string | symbol | {
    from?: string | symbol;
    default?: unknown;
}>;
type InjectToObject<T extends ComponentInjectOptions> = T extends string[] ? {
    [K in T[number]]?: unknown;
} : T extends ObjectInjectOptions ? {
    [K in keyof T]?: unknown;
} : never;
interface LegacyOptions<Props, D, C extends ComputedOptions, M extends MethodOptions, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin, I extends ComponentInjectOptions, II extends string, Provide extends ComponentProvideOptions = ComponentProvideOptions> {
    compatConfig?: CompatConfig;
    [key: string]: any;
    data?: (this: CreateComponentPublicInstanceWithMixins<Props, {}, {}, {}, MethodOptions, Mixin, Extends>, vm: CreateComponentPublicInstanceWithMixins<Props, {}, {}, {}, MethodOptions, Mixin, Extends>) => D;
    computed?: C;
    methods?: M;
    watch?: ComponentWatchOptions;
    provide?: Provide;
    inject?: I | II[];
    filters?: Record<string, Function>;
    mixins?: Mixin[];
    extends?: Extends;
    beforeCreate?(): any;
    created?(): any;
    beforeMount?(): any;
    mounted?(): any;
    beforeUpdate?(): any;
    updated?(): any;
    activated?(): any;
    deactivated?(): any;
    /** @deprecated use \`beforeUnmount\` instead */
    beforeDestroy?(): any;
    beforeUnmount?(): any;
    /** @deprecated use \`unmounted\` instead */
    destroyed?(): any;
    unmounted?(): any;
    renderTracked?: DebuggerHook;
    renderTriggered?: DebuggerHook;
    errorCaptured?: ErrorCapturedHook;
    /**
     * runtime compile only
     * @deprecated use \`compilerOptions.delimiters\` instead.
     */
    delimiters?: [string, string];
    /**
     * #3468
     *
     * type-only, used to assist Mixin's type inference,
     * TypeScript will try to simplify the inferred \`Mixin\` type,
     * with the \`__differentiator\`, TypeScript won't be able to combine different mixins,
     * because the \`__differentiator\` will be different
     */
    __differentiator?: keyof D | keyof C | keyof M;
}
type MergedHook<T = () => void> = T | T[];
type MergedComponentOptionsOverride = {
    beforeCreate?: MergedHook;
    created?: MergedHook;
    beforeMount?: MergedHook;
    mounted?: MergedHook;
    beforeUpdate?: MergedHook;
    updated?: MergedHook;
    activated?: MergedHook;
    deactivated?: MergedHook;
    /** @deprecated use \`beforeUnmount\` instead */
    beforeDestroy?: MergedHook;
    beforeUnmount?: MergedHook;
    /** @deprecated use \`unmounted\` instead */
    destroyed?: MergedHook;
    unmounted?: MergedHook;
    renderTracked?: MergedHook<DebuggerHook>;
    renderTriggered?: MergedHook<DebuggerHook>;
    errorCaptured?: MergedHook<ErrorCapturedHook>;
};
type OptionTypesKeys = 'P' | 'B' | 'D' | 'C' | 'M' | 'Defaults';
type OptionTypesType<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Defaults = {}> = {
    P: P;
    B: B;
    D: D;
    C: C;
    M: M;
    Defaults: Defaults;
};
/**
 * @deprecated
 */
export type ComponentOptionsWithoutProps<Props = {}, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, TE extends ComponentTypeEmits = {}, ResolvedEmits extends EmitsOptions = {} extends E ? TypeEmitsToOptions<TE> : E, PE = Props & EmitsToProps<ResolvedEmits>> = ComponentOptionsBase<PE, RawBindings, D, C, M, Mixin, Extends, E, EE, {}, I, II, S, LC, Directives, Exposed, Provide> & {
    props?: never;
    /**
     * @private for language-tools use only
     */
    __typeProps?: Props;
    /**
     * @private for language-tools use only
     */
    __typeEmits?: TE;
} & ThisType<CreateComponentPublicInstanceWithMixins<PE, RawBindings, D, C, M, Mixin, Extends, ResolvedEmits, EE, {}, false, I, S, LC, Directives, string>>;
/**
 * @deprecated
 */
export type ComponentOptionsWithArrayProps<PropNames extends string = string, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = EmitsOptions, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, Props = Prettify<Readonly<{
    [key in PropNames]?: any;
} & EmitsToProps<E>>>> = ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, {}, I, II, S, LC, Directives, Exposed, Provide> & {
    props: PropNames[];
} & ThisType<CreateComponentPublicInstanceWithMixins<Props, RawBindings, D, C, M, Mixin, Extends, E, Props, {}, false, I, S, LC, Directives, string>>;
/**
 * @deprecated
 */
export type ComponentOptionsWithObjectProps<PropsOptions = ComponentObjectPropsOptions, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = EmitsOptions, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, Props = Prettify<Readonly<ExtractPropTypes<PropsOptions>> & Readonly<EmitsToProps<E>>>, Defaults = ExtractDefaultPropTypes<PropsOptions>> = ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, Defaults, I, II, S, LC, Directives, Exposed, Provide> & {
    props: PropsOptions & ThisType<void>;
} & ThisType<CreateComponentPublicInstanceWithMixins<Props, RawBindings, D, C, M, Mixin, Extends, E, Props, Defaults, false, I, S, LC, Directives>>;

interface InjectionConstraint<T> {
}
export type InjectionKey<T> = symbol & InjectionConstraint<T>;
export declare function provide<T, K = InjectionKey<T> | string | number>(key: K, value: K extends InjectionKey<infer V> ? V : T): void;
export declare function inject<T>(key: InjectionKey<T> | string): T | undefined;
export declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T;
export declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T;
/**
 * Returns true if \`inject()\` can be used without warning about being called in the wrong place (e.g. outside of
 * setup()). This is used by libraries that want to use \`inject()\` internally without triggering a warning to the end
 * user. One example is \`useRoute()\` in \`vue-router\`.
 */
export declare function hasInjectionContext(): boolean;

export type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;
type ResolveProps<PropsOrPropOptions, E extends EmitsOptions> = Readonly<PropsOrPropOptions extends ComponentPropsOptions ? ExtractPropTypes<PropsOrPropOptions> : PropsOrPropOptions> & ({} extends E ? {} : EmitsToProps<E>);
export type DefineComponent<PropsOrPropOptions = {}, RawBindings = {}, D = {}, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, PP = PublicProps, Props = ResolveProps<PropsOrPropOptions, E>, Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>, S extends SlotsType = {}, LC extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, MakeDefaultsOptional extends boolean = true, TypeRefs extends Record<string, unknown> = {}, TypeEl extends Element = any> = ComponentPublicInstanceConstructor<CreateComponentPublicInstanceWithMixins<Props, RawBindings, D, C, M, Mixin, Extends, E, PP, Defaults, MakeDefaultsOptional, {}, S, LC & GlobalComponents, Directives & GlobalDirectives, Exposed, TypeRefs, TypeEl>> & ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, Defaults, {}, string, S, LC & GlobalComponents, Directives & GlobalDirectives, Exposed, Provide> & PP;
export type DefineSetupFnComponent<P extends Record<string, any>, E extends EmitsOptions = {}, S extends SlotsType = SlotsType, Props = P & EmitsToProps<E>, PP = PublicProps> = new (props: Props & PP) => CreateComponentPublicInstanceWithMixins<Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, E, PP, {}, false, {}, S>;
type ToResolvedProps<Props, Emits extends EmitsOptions> = Readonly<Props> & Readonly<EmitsToProps<Emits>>;
export declare function defineComponent<Props extends Record<string, any>, E extends EmitsOptions = {}, EE extends string = string, S extends SlotsType = {}>(setup: (props: Props, ctx: SetupContext<E, S>) => RenderFunction | Promise<RenderFunction>, options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
    props?: (keyof Props)[];
    emits?: E | EE[];
    slots?: S;
}): DefineSetupFnComponent<Props, E, S>;
export declare function defineComponent<Props extends Record<string, any>, E extends EmitsOptions = {}, EE extends string = string, S extends SlotsType = {}>(setup: (props: Props, ctx: SetupContext<E, S>) => RenderFunction | Promise<RenderFunction>, options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
    props?: ComponentObjectPropsOptions<Props>;
    emits?: E | EE[];
    slots?: S;
}): DefineSetupFnComponent<Props, E, S>;
export declare function defineComponent<TypeProps, RuntimePropsOptions extends ComponentObjectPropsOptions = ComponentObjectPropsOptions, RuntimePropsKeys extends string = string, TypeEmits extends ComponentTypeEmits = {}, RuntimeEmitsOptions extends EmitsOptions = {}, RuntimeEmitsKeys extends string = string, Data = {}, SetupBindings = {}, Computed extends ComputedOptions = {}, Methods extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, InjectOptions extends ComponentInjectOptions = {}, InjectKeys extends string = string, Slots extends SlotsType = {}, LocalComponents extends Record<string, Component> = {}, Directives extends Record<string, Directive> = {}, Exposed extends string = string, Provide extends ComponentProvideOptions = ComponentProvideOptions, ResolvedEmits extends EmitsOptions = {} extends RuntimeEmitsOptions ? TypeEmitsToOptions<TypeEmits> : RuntimeEmitsOptions, InferredProps = IsKeyValues<TypeProps> extends true ? TypeProps : string extends RuntimePropsKeys ? ComponentObjectPropsOptions extends RuntimePropsOptions ? {} : ExtractPropTypes<RuntimePropsOptions> : {
    [key in RuntimePropsKeys]?: any;
}, TypeRefs extends Record<string, unknown> = {}, TypeEl extends Element = any>(options: {
    props?: (RuntimePropsOptions & ThisType<void>) | RuntimePropsKeys[];
    /**
     * @private for language-tools use only
     */
    __typeProps?: TypeProps;
    /**
     * @private for language-tools use only
     */
    __typeEmits?: TypeEmits;
    /**
     * @private for language-tools use only
     */
    __typeRefs?: TypeRefs;
    /**
     * @private for language-tools use only
     */
    __typeEl?: TypeEl;
} & ComponentOptionsBase<ToResolvedProps<InferredProps, ResolvedEmits>, SetupBindings, Data, Computed, Methods, Mixin, Extends, RuntimeEmitsOptions, RuntimeEmitsKeys, {}, // Defaults
InjectOptions, InjectKeys, Slots, LocalComponents, Directives, Exposed, Provide> & ThisType<CreateComponentPublicInstanceWithMixins<ToResolvedProps<InferredProps, ResolvedEmits>, SetupBindings, Data, Computed, Methods, Mixin, Extends, ResolvedEmits, {}, {}, false, InjectOptions, Slots, LocalComponents, Directives, string>>): DefineComponent<InferredProps, SetupBindings, Data, Computed, Methods, Mixin, Extends, ResolvedEmits, RuntimeEmitsKeys, PublicProps, ToResolvedProps<InferredProps, ResolvedEmits>, ExtractDefaultPropTypes<RuntimePropsOptions>, Slots, LocalComponents, Directives, Exposed, Provide, unknown extends TypeProps ? true : false, TypeRefs, TypeEl>;

export interface App<HostElement = any> {
    version: string;
    config: AppConfig;
    use<Options extends unknown[]>(plugin: Plugin<Options>, ...options: NoInfer<Options>): this;
    use<Options>(plugin: Plugin<Options>, options: NoInfer<Options>): this;
    mixin(mixin: ComponentOptions): this;
    component(name: string): Component | undefined;
    component<T extends Component | DefineComponent>(name: string, component: T): this;
    directive<HostElement = any, Value = any, Modifiers extends string = string, Arg = any>(name: string): Directive<HostElement, Value, Modifiers, Arg> | undefined;
    directive<HostElement = any, Value = any, Modifiers extends string = string, Arg = any>(name: string, directive: Directive<HostElement, Value, Modifiers, Arg>): this;
    mount(rootContainer: HostElement | string, 
    /**
     * @internal
     */
    isHydrate?: boolean, 
    /**
     * @internal
     */
    namespace?: boolean | ElementNamespace, 
    /**
     * @internal
     */
    vnode?: VNode): ComponentPublicInstance;
    unmount(): void;
    onUnmount(cb: () => void): void;
    provide<T, K = InjectionKey<T> | string | number>(key: K, value: K extends InjectionKey<infer V> ? V : T): this;
    /**
     * Runs a function with the app as active instance. This allows using of \`inject()\` within the function to get access
     * to variables provided via \`app.provide()\`.
     *
     * @param fn - function to run with the app as active instance
     */
    runWithContext<T>(fn: () => T): T;
    _uid: number;
    _component: ConcreteComponent;
    _props: Data | null;
    _container: HostElement | null;
    _context: AppContext;
    _instance: ComponentInternalInstance | null;
    /**
     * v2 compat only
     */
    filter?(name: string): Function | undefined;
    filter?(name: string, filter: Function): this;
}
export type OptionMergeFunction = (to: unknown, from: unknown) => any;
export interface AppConfig {
    readonly isNativeTag: (tag: string) => boolean;
    performance: boolean;
    optionMergeStrategies: Record<string, OptionMergeFunction>;
    globalProperties: ComponentCustomProperties & Record<string, any>;
    errorHandler?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void;
    warnHandler?: (msg: string, instance: ComponentPublicInstance | null, trace: string) => void;
    /**
     * Options to pass to \`@vue/compiler-dom\`.
     * Only supported in runtime compiler build.
     */
    compilerOptions: RuntimeCompilerOptions;
    /**
     * @deprecated use config.compilerOptions.isCustomElement
     */
    isCustomElement?: (tag: string) => boolean;
    /**
     * TODO document for 3.5
     * Enable warnings for computed getters that recursively trigger itself.
     */
    warnRecursiveComputed?: boolean;
    /**
     * Whether to throw unhandled errors in production.
     * Default is \`false\` to avoid crashing on any error (and only logs it)
     * But in some cases, e.g. SSR, throwing might be more desirable.
     */
    throwUnhandledErrorInProduction?: boolean;
    /**
     * Prefix for all useId() calls within this app
     */
    idPrefix?: string;
}
export interface AppContext {
    app: App;
    config: AppConfig;
    mixins: ComponentOptions[];
    components: Record<string, Component>;
    directives: Record<string, Directive>;
    provides: Record<string | symbol, any>;
}
type PluginInstallFunction<Options = any[]> = Options extends unknown[] ? (app: App, ...options: Options) => any : (app: App, options: Options) => any;
export type ObjectPlugin<Options = any[]> = {
    install: PluginInstallFunction<Options>;
};
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>;
export type Plugin<Options = any[], P extends unknown[] = Options extends unknown[] ? Options : [Options]> = FunctionPlugin<P> | ObjectPlugin<P>;
export type CreateAppFunction<HostElement> = (rootComponent: Component, rootProps?: Data | null) => App<HostElement>;

type TeleportVNode = VNode<RendererNode, RendererElement, TeleportProps>;
export interface TeleportProps {
    to: string | RendererElement | null | undefined;
    disabled?: boolean;
    defer?: boolean;
}
declare const TeleportImpl: {
    name: string;
    __isTeleport: boolean;
    process(n1: TeleportVNode | null, n2: TeleportVNode, container: RendererElement, anchor: RendererNode | null, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, namespace: ElementNamespace, slotScopeIds: string[] | null, optimized: boolean, internals: RendererInternals): void;
    remove(vnode: VNode, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, { um: unmount, o: { remove: hostRemove } }: RendererInternals, doRemove: boolean): void;
    move: typeof moveTeleport;
    hydrate: typeof hydrateTeleport;
};
declare enum TeleportMoveTypes {
    TARGET_CHANGE = 0,
    TOGGLE = 1,// enable / disable
    REORDER = 2
}
declare function moveTeleport(vnode: VNode, container: RendererElement, parentAnchor: RendererNode | null, { o: { insert }, m: move }: RendererInternals, moveType?: TeleportMoveTypes): void;
declare function hydrateTeleport(node: Node, vnode: TeleportVNode, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, slotScopeIds: string[] | null, optimized: boolean, { o: { nextSibling, parentNode, querySelector, insert, createText }, }: RendererInternals<Node, Element>, hydrateChildren: (node: Node | null, vnode: VNode, container: Element, parentComponent: ComponentInternalInstance | null, parentSuspense: SuspenseBoundary | null, slotScopeIds: string[] | null, optimized: boolean) => Node | null): Node | null;
export declare const Teleport: {
    __isTeleport: true;
    new (): {
        \$props: VNodeProps & TeleportProps;
        \$slots: {
            default(): VNode[];
        };
    };
};

/**
 * @private
 */
export declare function resolveComponent(name: string, maybeSelfReference?: boolean): ConcreteComponent | string;
declare const NULL_DYNAMIC_COMPONENT: unique symbol;
/**
 * @private
 */
export declare function resolveDynamicComponent(component: unknown): VNodeTypes;
/**
 * @private
 */
export declare function resolveDirective(name: string): Directive | undefined;

export declare const Fragment: {
    __isFragment: true;
    new (): {
        \$props: VNodeProps;
    };
};
export declare const Text: unique symbol;
export declare const Comment: unique symbol;
export declare const Static: unique symbol;
export type VNodeTypes = string | VNode | Component | typeof Text | typeof Static | typeof Comment | typeof Fragment | typeof Teleport | typeof TeleportImpl | typeof Suspense | typeof SuspenseImpl;
export type VNodeRef = string | Ref | ((ref: Element | ComponentPublicInstance | null, refs: Record<string, any>) => void);
type VNodeNormalizedRefAtom = {
    /**
     * component instance
     */
    i: ComponentInternalInstance;
    /**
     * Actual ref
     */
    r: VNodeRef;
    /**
     * setup ref key
     */
    k?: string;
    /**
     * refInFor marker
     */
    f?: boolean;
};
type VNodeNormalizedRef = VNodeNormalizedRefAtom | VNodeNormalizedRefAtom[];
type VNodeMountHook = (vnode: VNode) => void;
type VNodeUpdateHook = (vnode: VNode, oldVNode: VNode) => void;
export type VNodeProps = {
    key?: PropertyKey;
    ref?: VNodeRef;
    ref_for?: boolean;
    ref_key?: string;
    onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[];
    onVnodeMounted?: VNodeMountHook | VNodeMountHook[];
    onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[];
    onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[];
    onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[];
    onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[];
};
type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
export type VNodeNormalizedChildren = string | VNodeArrayChildren | RawSlots | null;
export interface VNode<HostNode = RendererNode, HostElement = RendererElement, ExtraProps = {
    [key: string]: any;
}> {
    type: VNodeTypes;
    props: (VNodeProps & ExtraProps) | null;
    key: PropertyKey | null;
    ref: VNodeNormalizedRef | null;
    /**
     * SFC only. This is assigned on vnode creation using currentScopeId
     * which is set alongside currentRenderingInstance.
     */
    scopeId: string | null;
    children: VNodeNormalizedChildren;
    component: ComponentInternalInstance | null;
    dirs: DirectiveBinding[] | null;
    transition: TransitionHooks<HostElement> | null;
    el: HostNode | null;
    placeholder: HostNode | null;
    anchor: HostNode | null;
    target: HostElement | null;
    targetStart: HostNode | null;
    targetAnchor: HostNode | null;
    suspense: SuspenseBoundary | null;
    shapeFlag: number;
    patchFlag: number;
    appContext: AppContext | null;
}
/**
 * Open a block.
 * This must be called before \`createBlock\`. It cannot be part of \`createBlock\`
 * because the children of the block are evaluated before \`createBlock\` itself
 * is called. The generated code typically looks like this:
 *
 * \`\`\`js
 * function render() {
 *   return (openBlock(),createBlock('div', null, [...]))
 * }
 * \`\`\`
 * disableTracking is true when creating a v-for fragment block, since a v-for
 * fragment always diffs its children.
 *
 * @private
 */
export declare function openBlock(disableTracking?: boolean): void;
/**
 * Block tracking sometimes needs to be disabled, for example during the
 * creation of a tree that needs to be cached by v-once. The compiler generates
 * code like this:
 *
 * \`\`\` js
 * _cache[1] || (
 *   setBlockTracking(-1, true),
 *   _cache[1] = createVNode(...),
 *   setBlockTracking(1),
 *   _cache[1]
 * )
 * \`\`\`
 *
 * @private
 */
export declare function setBlockTracking(value: number, inVOnce?: boolean): void;
/**
 * @private
 */
export declare function createElementBlock(type: string | typeof Fragment, props?: Record<string, any> | null, children?: any, patchFlag?: number, dynamicProps?: string[], shapeFlag?: number): VNode;
/**
 * Create a block root vnode. Takes the same exact arguments as \`createVNode\`.
 * A block root keeps track of dynamic nodes within the block in the
 * \`dynamicChildren\` array.
 *
 * @private
 */
export declare function createBlock(type: VNodeTypes | ClassComponent, props?: Record<string, any> | null, children?: any, patchFlag?: number, dynamicProps?: string[]): VNode;
export declare function isVNode(value: any): value is VNode;
declare let vnodeArgsTransformer: ((args: Parameters<typeof _createVNode>, instance: ComponentInternalInstance | null) => Parameters<typeof _createVNode>) | undefined;
/**
 * Internal API for registering an arguments transform for createVNode
 * used for creating stubs in the test-utils
 * It is *internal* but needs to be exposed for test-utils to pick up proper
 * typings
 */
export declare function transformVNodeArgs(transformer?: typeof vnodeArgsTransformer): void;
export declare function createBaseVNode(type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT, props?: (Data & VNodeProps) | null, children?: unknown, patchFlag?: number, dynamicProps?: string[] | null, shapeFlag?: number, isBlockNode?: boolean, needFullChildrenNormalization?: boolean): VNode;

export declare const createVNode: typeof _createVNode;
declare function _createVNode(type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT, props?: (Data & VNodeProps) | null, children?: unknown, patchFlag?: number, dynamicProps?: string[] | null, isBlockNode?: boolean): VNode;
export declare function guardReactiveProps(props: (Data & VNodeProps) | null): (Data & VNodeProps) | null;
export declare function cloneVNode<T, U>(vnode: VNode<T, U>, extraProps?: (Data & VNodeProps) | null, mergeRef?: boolean, cloneTransition?: boolean): VNode<T, U>;
/**
 * @private
 */
export declare function createTextVNode(text?: string, flag?: number): VNode;
/**
 * @private
 */
export declare function createStaticVNode(content: string, numberOfNodes: number): VNode;
/**
 * @private
 */
export declare function createCommentVNode(text?: string, asBlock?: boolean): VNode;
export declare function mergeProps(...args: (Data & VNodeProps)[]): Data;

type Data = Record<string, unknown>;
/**
 * Public utility type for extracting the instance type of a component.
 * Works with all valid component definition types. This is intended to replace
 * the usage of \`InstanceType<typeof Comp>\` which only works for
 * constructor-based component definition types.
 *
 * @example
 * \`\`\`ts
 * const MyComp = { ... }
 * declare const instance: ComponentInstance<typeof MyComp>
 * \`\`\`
 */
export type ComponentInstance<T> = T extends {
    new (): ComponentPublicInstance;
} ? InstanceType<T> : T extends FunctionalComponent<infer Props, infer Emits> ? ComponentPublicInstance<Props, {}, {}, {}, {}, ShortEmitsToObject<Emits>> : T extends Component<infer PropsOrInstance, infer RawBindings, infer D, infer C, infer M> ? PropsOrInstance extends {
    \$props: unknown;
} ? PropsOrInstance : ComponentPublicInstance<unknown extends PropsOrInstance ? {} : PropsOrInstance, unknown extends RawBindings ? {} : RawBindings, unknown extends D ? {} : D, C, M> : never;
/**
 * For extending allowed non-declared props on components in TSX
 */
export interface ComponentCustomProps {
}
/**
 * For globally defined Directives
 * Here is an example of adding a directive \`VTooltip\` as global directive:
 *
 * @example
 * \`\`\`ts
 * import VTooltip from 'v-tooltip'
 *
 * declare module '@vue/runtime-core' {
 *   interface GlobalDirectives {
 *     VTooltip
 *   }
 * }
 * \`\`\`
 */
export interface GlobalDirectives {
}
/**
 * For globally defined Components
 * Here is an example of adding a component \`RouterView\` as global component:
 *
 * @example
 * \`\`\`ts
 * import { RouterView } from 'vue-router'
 *
 * declare module '@vue/runtime-core' {
 *   interface GlobalComponents {
 *     RouterView
 *   }
 * }
 * \`\`\`
 */
export interface GlobalComponents {
    Teleport: DefineComponent<TeleportProps>;
    Suspense: DefineComponent<SuspenseProps>;
    KeepAlive: DefineComponent<KeepAliveProps>;
    BaseTransition: DefineComponent<BaseTransitionProps>;
}
/**
 * Default allowed non-declared props on component in TSX
 */
export interface AllowedComponentProps {
    class?: unknown;
    style?: unknown;
}
interface ComponentInternalOptions {
    /**
     * Compat build only, for bailing out of certain compatibility behavior
     */
    __isBuiltIn?: boolean;
    /**
     * This one should be exposed so that devtools can make use of it
     */
    __file?: string;
    /**
     * name inferred from filename
     */
    __name?: string;
}
export interface FunctionalComponent<P = {}, E extends EmitsOptions | Record<string, any[]> = {}, S extends Record<string, any> = any, EE extends EmitsOptions = ShortEmitsToObject<E>> extends ComponentInternalOptions {
    (props: P & EmitsToProps<EE>, ctx: Omit<SetupContext<EE, IfAny<S, {}, SlotsType<S>>>, 'expose'>): any;
    props?: ComponentPropsOptions<P>;
    emits?: EE | (keyof EE)[];
    slots?: IfAny<S, Slots, SlotsType<S>>;
    inheritAttrs?: boolean;
    displayName?: string;
    compatConfig?: CompatConfig;
}
interface ClassComponent {
    new (...args: any[]): ComponentPublicInstance<any, any, any, any, any>;
    __vccOpts: ComponentOptions;
}
/**
 * Concrete component type matches its actual value: it's either an options
 * object, or a function. Use this where the code expects to work with actual
 * values, e.g. checking if its a function or not. This is mostly for internal
 * implementation code.
 */
export type ConcreteComponent<Props = {}, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions, E extends EmitsOptions | Record<string, any[]> = {}, S extends Record<string, any> = any> = ComponentOptions<Props, RawBindings, D, C, M> | FunctionalComponent<Props, E, S>;
/**
 * A type used in public APIs where a component type is expected.
 * The constructor type is an artificial type returned by defineComponent().
 */
export type Component<PropsOrInstance = any, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions, E extends EmitsOptions | Record<string, any[]> = {}, S extends Record<string, any> = any> = ConcreteComponent<PropsOrInstance, RawBindings, D, C, M, E, S> | ComponentPublicInstanceConstructor<PropsOrInstance>;

export type SetupContext<E = EmitsOptions, S extends SlotsType = {}> = E extends any ? {
    attrs: Data;
    slots: UnwrapSlotsType<S>;
    emit: EmitFn<E>;
    expose: <Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed) => void;
} : never;
/**
 * We expose a subset of properties on the internal instance as they are
 * useful for advanced external libraries and tools.
 */
export interface ComponentInternalInstance {
    uid: number;
    type: ConcreteComponent;
    parent: ComponentInternalInstance | null;
    root: ComponentInternalInstance;
    appContext: AppContext;
    /**
     * Vnode representing this component in its parent's vdom tree
     */
    vnode: VNode;
    /**
     * Root vnode of this component's own vdom tree
     */
    subTree: VNode;
    /**
     * Render effect instance
     */
    effect: ReactiveEffect;
    /**
     * Force update render effect
     */
    update: () => void;
    /**
     * Render effect job to be passed to scheduler (checks if dirty)
     */
    job: SchedulerJob;
    proxy: ComponentPublicInstance | null;
    exposed: Record<string, any> | null;
    exposeProxy: Record<string, any> | null;
    data: Data;
    props: Data;
    attrs: Data;
    slots: InternalSlots;
    refs: Data;
    emit: EmitFn;
    isMounted: boolean;
    isUnmounted: boolean;
    isDeactivated: boolean;
}
export declare const getCurrentInstance: () => ComponentInternalInstance | null;
/**
 * For runtime-dom to register the compiler.
 * Note the exported method uses any to avoid d.ts relying on the compiler types.
 */
export declare function registerRuntimeCompiler(_compile: any): void;
export declare const isRuntimeOnly: () => boolean;
export interface ComponentCustomElementInterface {
}

type MaybeUndefined<T, I> = I extends true ? T | undefined : T;
type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V> ? MaybeUndefined<V, Immediate> : T[K] extends object ? MaybeUndefined<T[K], Immediate> : never;
};
export interface WatchEffectOptions extends DebuggerOptions {
    flush?: 'pre' | 'post' | 'sync';
}
export interface WatchOptions<Immediate = boolean> extends WatchEffectOptions {
    immediate?: Immediate;
    deep?: boolean | number;
    once?: boolean;
}
export declare function watchEffect(effect: WatchEffect, options?: WatchEffectOptions): WatchHandle;
export declare function watchPostEffect(effect: WatchEffect, options?: DebuggerOptions): WatchHandle;
export declare function watchSyncEffect(effect: WatchEffect, options?: DebuggerOptions): WatchHandle;
export type MultiWatchSources = (WatchSource<unknown> | object)[];
export declare function watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export declare function watch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(sources: readonly [...T] | T, cb: [T] extends [ReactiveMarker] ? WatchCallback<T, MaybeUndefined<T, Immediate>> : WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export declare function watch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;
export declare function watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, MaybeUndefined<T, Immediate>>, options?: WatchOptions<Immediate>): WatchHandle;

/**
 * A lazy hydration strategy for async components.
 * @param hydrate - call this to perform the actual hydration.
 * @param forEachElement - iterate through the root elements of the component's
 *                         non-hydrated DOM, accounting for possible fragments.
 * @returns a teardown function to be called if the async component is unmounted
 *          before it is hydrated. This can be used to e.g. remove DOM event
 *          listeners.
 */
export type HydrationStrategy = (hydrate: () => void, forEachElement: (cb: (el: Element) => any) => void) => (() => void) | void;
export type HydrationStrategyFactory<Options> = (options?: Options) => HydrationStrategy;
export declare const hydrateOnIdle: HydrationStrategyFactory<number>;
export declare const hydrateOnVisible: HydrationStrategyFactory<IntersectionObserverInit>;
export declare const hydrateOnMediaQuery: HydrationStrategyFactory<string>;
export declare const hydrateOnInteraction: HydrationStrategyFactory<keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap>>;

type AsyncComponentResolveResult<T = Component> = T | {
    default: T;
};
export type AsyncComponentLoader<T = any> = () => Promise<AsyncComponentResolveResult<T>>;
export interface AsyncComponentOptions<T = any> {
    loader: AsyncComponentLoader<T>;
    loadingComponent?: Component;
    errorComponent?: Component;
    delay?: number;
    timeout?: number;
    suspensible?: boolean;
    hydrate?: HydrationStrategy;
    onError?: (error: Error, retry: () => void, fail: () => void, attempts: number) => any;
}
export declare function defineAsyncComponent<T extends Component = {
    new (): ComponentPublicInstance;
}>(source: AsyncComponentLoader<T> | AsyncComponentOptions<T>): T;

export declare function useModel<M extends PropertyKey, T extends Record<string, any>, K extends keyof T, G = T[K], S = T[K]>(props: T, name: K, options?: DefineModelOptions<T[K], G, S>): ModelRef<T[K], M, G, S>;

export type TemplateRef<T = unknown> = Readonly<ShallowRef<T | null>>;
export declare function useTemplateRef<T = unknown, Keys extends string = string>(key: Keys): TemplateRef<T>;

export declare function useId(): string;

type RawProps = VNodeProps & {
    __v_isVNode?: never;
    [Symbol.iterator]?: never;
} & Record<string, any>;
type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);
interface Constructor<P = any> {
    __isFragment?: never;
    __isTeleport?: never;
    __isSuspense?: never;
    new (...args: any[]): {
        \$props: P;
    };
}
type HTMLElementEventHandler = {
    [K in keyof HTMLElementEventMap as \`on\${Capitalize<K>}\`]?: (ev: HTMLElementEventMap[K]) => any;
};
export declare function h<K extends keyof HTMLElementTagNameMap>(type: K, children?: RawChildren): VNode;
export declare function h<K extends keyof HTMLElementTagNameMap>(type: K, props?: (RawProps & HTMLElementEventHandler) | null, children?: RawChildren | RawSlots): VNode;
export declare function h(type: string, children?: RawChildren): VNode;
export declare function h(type: string, props?: RawProps | null, children?: RawChildren | RawSlots): VNode;
export declare function h(type: typeof Text | typeof Comment, children?: string | number | boolean): VNode;
export declare function h(type: typeof Text | typeof Comment, props?: null, children?: string | number | boolean): VNode;
export declare function h(type: typeof Fragment, children?: VNodeArrayChildren): VNode;
export declare function h(type: typeof Fragment, props?: RawProps | null, children?: VNodeArrayChildren): VNode;
export declare function h(type: typeof Teleport, props: RawProps & TeleportProps, children: RawChildren | RawSlots): VNode;
export declare function h(type: typeof Suspense, children?: RawChildren): VNode;
export declare function h(type: typeof Suspense, props?: (RawProps & SuspenseProps) | null, children?: RawChildren | RawSlots): VNode;
export declare function h<P, E extends EmitsOptions = {}, S extends Record<string, any> = any>(type: FunctionalComponent<P, any, S, any>, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren | IfAny<S, RawSlots, S>): VNode;
export declare function h(type: Component, children?: RawChildren): VNode;
export declare function h<P>(type: ConcreteComponent | string, children?: RawChildren): VNode;
export declare function h<P>(type: ConcreteComponent<P> | string, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren): VNode;
export declare function h<P>(type: Component<P>, props?: (RawProps & P) | null, children?: RawChildren | RawSlots): VNode;
export declare function h<P>(type: ComponentOptions<P>, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren | RawSlots): VNode;
export declare function h(type: Constructor, children?: RawChildren): VNode;
export declare function h<P>(type: Constructor<P>, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren | RawSlots): VNode;
export declare function h(type: DefineComponent, children?: RawChildren): VNode;
export declare function h<P>(type: DefineComponent<P>, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren | RawSlots): VNode;
export declare function h(type: string | Component, children?: RawChildren): VNode;
export declare function h<P>(type: string | Component<P>, props?: (RawProps & P) | ({} extends P ? null : never), children?: RawChildren | RawSlots): VNode;

export declare const ssrContextKey: unique symbol;
export declare const useSSRContext: <T = Record<string, any>>() => T | undefined;

declare function warn\$1(msg: string, ...args: any[]): void;

export declare enum ErrorCodes {
    SETUP_FUNCTION = 0,
    RENDER_FUNCTION = 1,
    NATIVE_EVENT_HANDLER = 5,
    COMPONENT_EVENT_HANDLER = 6,
    VNODE_HOOK = 7,
    DIRECTIVE_HOOK = 8,
    TRANSITION_HOOK = 9,
    APP_ERROR_HANDLER = 10,
    APP_WARN_HANDLER = 11,
    FUNCTION_REF = 12,
    ASYNC_COMPONENT_LOADER = 13,
    SCHEDULER = 14,
    COMPONENT_UPDATE = 15,
    APP_UNMOUNT_CLEANUP = 16
}
type ErrorTypes = LifecycleHooks | ErrorCodes | WatchErrorCodes;
export declare function callWithErrorHandling(fn: Function, instance: ComponentInternalInstance | null | undefined, type: ErrorTypes, args?: unknown[]): any;
export declare function callWithAsyncErrorHandling(fn: Function | Function[], instance: ComponentInternalInstance | null, type: ErrorTypes, args?: unknown[]): any;
export declare function handleError(err: unknown, instance: ComponentInternalInstance | null | undefined, type: ErrorTypes, throwInDev?: boolean): void;

export declare function initCustomFormatter(): void;

interface AppRecord {
    id: number;
    app: App;
    version: string;
    types: Record<string, string | Symbol>;
}
interface DevtoolsHook {
    enabled?: boolean;
    emit: (event: string, ...payload: any[]) => void;
    on: (event: string, handler: Function) => void;
    once: (event: string, handler: Function) => void;
    off: (event: string, handler: Function) => void;
    appRecords: AppRecord[];
    /**
     * Added at https://github.com/vuejs/devtools/commit/f2ad51eea789006ab66942e5a27c0f0986a257f9
     * Returns whether the arg was buffered or not
     */
    cleanupBuffer?: (matchArg: unknown) => boolean;
}
declare function setDevtoolsHook\$1(hook: DevtoolsHook, target: any): void;

type HMRComponent = ComponentOptions | ClassComponent;
export interface HMRRuntime {
    createRecord: typeof createRecord;
    rerender: typeof rerender;
    reload: typeof reload;
}
declare function createRecord(id: string, initialDef: HMRComponent): boolean;
declare function rerender(id: string, newRender?: Function): void;
declare function reload(id: string, newComp: HMRComponent): void;

/**
 * Set scope id when creating hoisted vnodes.
 * @private compiler helper
 */
export declare function pushScopeId(id: string | null): void;
/**
 * Technically we no longer need this after 3.0.8 but we need to keep the same
 * API for backwards compat w/ code generated by compilers.
 * @private
 */
export declare function popScopeId(): void;
/**
 * Only for backwards compat
 * @private
 */
export declare const withScopeId: (_id: string) => typeof withCtx;
/**
 * Wrap a slot function to memoize current rendering instance
 * @private compiler helper
 */
export declare function withCtx(fn: Function, ctx?: ComponentInternalInstance | null, isNonScopedSlot?: boolean): Function;

/**
 * v-for string
 * @private
 */
export declare function renderList(source: string, renderItem: (value: string, index: number) => VNodeChild): VNodeChild[];
/**
 * v-for number
 */
export declare function renderList(source: number, renderItem: (value: number, index: number) => VNodeChild): VNodeChild[];
/**
 * v-for array
 */
export declare function renderList<T>(source: T[], renderItem: (value: T, index: number) => VNodeChild): VNodeChild[];
/**
 * v-for iterable
 */
export declare function renderList<T>(source: Iterable<T>, renderItem: (value: T, index: number) => VNodeChild): VNodeChild[];
/**
 * v-for object
 */
export declare function renderList<T>(source: T, renderItem: <K extends keyof T>(value: T[K], key: string, index: number) => VNodeChild): VNodeChild[];

/**
 * For prefixing keys in v-on="obj" with "on"
 * @private
 */
export declare function toHandlers(obj: Record<string, any>, preserveCaseIfNecessary?: boolean): Record<string, any>;

/**
 * Compiler runtime helper for rendering \`<slot/>\`
 * @private
 */
export declare function renderSlot(slots: Slots, name: string, props?: Data, fallback?: () => VNodeArrayChildren, noSlotted?: boolean): VNode;

type SSRSlot = (...args: any[]) => VNode[] | undefined;
interface CompiledSlotDescriptor {
    name: string;
    fn: SSRSlot;
    key?: string;
}
/**
 * Compiler runtime helper for creating dynamic slots object
 * @private
 */
export declare function createSlots(slots: Record<string, SSRSlot>, dynamicSlots: (CompiledSlotDescriptor | CompiledSlotDescriptor[] | undefined)[]): Record<string, SSRSlot>;

export declare function withMemo(memo: any[], render: () => VNode<any, any>, cache: any[], index: number): VNode<any, any>;
export declare function isMemoSame(cached: VNode, memo: any[]): boolean;

export type LegacyConfig = {
    /**
     * @deprecated \`config.silent\` option has been removed
     */
    silent?: boolean;
    /**
     * @deprecated use __VUE_PROD_DEVTOOLS__ compile-time feature flag instead
     * https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
     */
    devtools?: boolean;
    /**
     * @deprecated use \`config.isCustomElement\` instead
     * https://v3-migration.vuejs.org/breaking-changes/global-api.html#config-ignoredelements-is-now-config-iscustomelement
     */
    ignoredElements?: (string | RegExp)[];
    /**
     * @deprecated
     * https://v3-migration.vuejs.org/breaking-changes/keycode-modifiers.html
     */
    keyCodes?: Record<string, number | number[]>;
    /**
     * @deprecated
     * https://v3-migration.vuejs.org/breaking-changes/global-api.html#config-productiontip-removed
     */
    productionTip?: boolean;
};

type LegacyPublicInstance = ComponentPublicInstance & LegacyPublicProperties;
interface LegacyPublicProperties {
    \$set<T extends Record<keyof any, any>, K extends keyof T>(target: T, key: K, value: T[K]): void;
    \$delete<T extends Record<keyof any, any>, K extends keyof T>(target: T, key: K): void;
    \$mount(el?: string | Element): this;
    \$destroy(): void;
    \$scopedSlots: Slots;
    \$on(event: string | string[], fn: Function): this;
    \$once(event: string, fn: Function): this;
    \$off(event?: string | string[], fn?: Function): this;
    \$children: LegacyPublicProperties[];
    \$listeners: Record<string, Function | Function[]>;
}

/**
 * @deprecated the default \`Vue\` export has been removed in Vue 3. The type for
 * the default export is provided only for migration purposes. Please use
 * named imports instead - e.g. \`import { createApp } from 'vue'\`.
 */
export type CompatVue = Pick<App, 'version' | 'component' | 'directive'> & {
    configureCompat: typeof configureCompat;
    new (options?: ComponentOptions): LegacyPublicInstance;
    version: string;
    config: AppConfig & LegacyConfig;
    nextTick: typeof nextTick;
    use<Options extends unknown[]>(plugin: Plugin<Options>, ...options: Options): CompatVue;
    use<Options>(plugin: Plugin<Options>, options: Options): CompatVue;
    mixin(mixin: ComponentOptions): CompatVue;
    component(name: string): Component | undefined;
    component(name: string, component: Component): CompatVue;
    directive<T = any, V = any>(name: string): Directive<T, V> | undefined;
    directive<T = any, V = any>(name: string, directive: Directive<T, V>): CompatVue;
    compile(template: string): RenderFunction;
    /**
     * @deprecated Vue 3 no longer supports extending constructors.
     */
    extend: (options?: ComponentOptions) => CompatVue;
    /**
     * @deprecated Vue 3 no longer needs set() for adding new properties.
     */
    set(target: any, key: PropertyKey, value: any): void;
    /**
     * @deprecated Vue 3 no longer needs delete() for property deletions.
     */
    delete(target: any, key: PropertyKey): void;
    /**
     * @deprecated use \`reactive\` instead.
     */
    observable: typeof reactive;
    /**
     * @deprecated filters have been removed from Vue 3.
     */
    filter(name: string, arg?: any): null;
};

export declare const version: string;

export declare const warn: typeof warn\$1;

export declare const devtools: DevtoolsHook;
export declare const setDevtoolsHook: typeof setDevtoolsHook\$1;

declare module '@vue/reactivity' {
    interface RefUnwrapBailTypes {
        runtimeCoreBailTypes: VNode | {
            \$: ComponentInternalInstance;
        };
    }
}

export declare const DeprecationTypes: typeof DeprecationTypes\$1;

export { createBaseVNode as createElementVNode,  };
export type { WatchEffectOptions as WatchOptionsBase };
// Note: this file is auto concatenated to the end of the bundled d.ts during
// build.

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Teleport: DefineComponent<TeleportProps>
    Suspense: DefineComponent<SuspenseProps>
    KeepAlive: DefineComponent<KeepAliveProps>
    BaseTransition: DefineComponent<BaseTransitionProps>
  }
}

// Note: this file is auto concatenated to the end of the bundled d.ts during
// build.
type _defineProps = typeof defineProps
type _defineEmits = typeof defineEmits
type _defineExpose = typeof defineExpose
type _defineOptions = typeof defineOptions
type _defineSlots = typeof defineSlots
type _defineModel = typeof defineModel
type _withDefaults = typeof withDefaults

declare global {
  const defineProps: _defineProps
  const defineEmits: _defineEmits
  const defineExpose: _defineExpose
  const defineOptions: _defineOptions
  const defineSlots: _defineSlots
  const defineModel: _defineModel
  const withDefaults: _withDefaults
}
`);

vueDtsMap.set('file:///node_modules/@vue/reactivity/index.d.ts', `import { IfAny } from '@vue/shared';

export declare enum TrackOpTypes {
    GET = "get",
    HAS = "has",
    ITERATE = "iterate"
}
export declare enum TriggerOpTypes {
    SET = "set",
    ADD = "add",
    DELETE = "delete",
    CLEAR = "clear"
}
export declare enum ReactiveFlags {
    SKIP = "__v_skip",
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly",
    IS_SHALLOW = "__v_isShallow",
    RAW = "__v_raw",
    IS_REF = "__v_isRef"
}

export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>;
declare const ReactiveMarkerSymbol: unique symbol;
export interface ReactiveMarker {
    [ReactiveMarkerSymbol]?: void;
}
export type Reactive<T> = UnwrapNestedRefs<T> & (T extends readonly any[] ? ReactiveMarker : {});
/**
 * Returns a reactive proxy of the object.
 *
 * The reactive conversion is "deep": it affects all nested properties. A
 * reactive object also deeply unwraps any properties that are refs while
 * maintaining reactivity.
 *
 * @example
 * \`\`\`js
 * const obj = reactive({ count: 0 })
 * \`\`\`
 *
 * @param target - The source object.
 * @see {@link https://vuejs.org/api/reactivity-core.html#reactive}
 */
export declare function reactive<T extends object>(target: T): Reactive<T>;
declare const ShallowReactiveMarker: unique symbol;
export type ShallowReactive<T> = T & {
    [ShallowReactiveMarker]?: true;
};
/**
 * Shallow version of {@link reactive}.
 *
 * Unlike {@link reactive}, there is no deep conversion: only root-level
 * properties are reactive for a shallow reactive object. Property values are
 * stored and exposed as-is - this also means properties with ref values will
 * not be automatically unwrapped.
 *
 * @example
 * \`\`\`js
 * const state = shallowReactive({
 *   foo: 1,
 *   nested: {
 *     bar: 2
 *   }
 * })
 *
 * // mutating state's own properties is reactive
 * state.foo++
 *
 * // ...but does not convert nested objects
 * isReactive(state.nested) // false
 *
 * // NOT reactive
 * state.nested.bar++
 * \`\`\`
 *
 * @param target - The source object.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#shallowreactive}
 */
export declare function shallowReactive<T extends object>(target: T): ShallowReactive<T>;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type Builtin = Primitive | Function | Date | Error | RegExp;
export type DeepReadonly<T> = T extends Builtin ? T : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends WeakMap<infer K, infer V> ? WeakMap<DeepReadonly<K>, DeepReadonly<V>> : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends ReadonlySet<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends WeakSet<infer U> ? WeakSet<DeepReadonly<U>> : T extends Promise<infer U> ? Promise<DeepReadonly<U>> : T extends Ref<infer U, unknown> ? Readonly<Ref<DeepReadonly<U>>> : T extends {} ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : Readonly<T>;
/**
 * Takes an object (reactive or plain) or a ref and returns a readonly proxy to
 * the original.
 *
 * A readonly proxy is deep: any nested property accessed will be readonly as
 * well. It also has the same ref-unwrapping behavior as {@link reactive},
 * except the unwrapped values will also be made readonly.
 *
 * @example
 * \`\`\`js
 * const original = reactive({ count: 0 })
 *
 * const copy = readonly(original)
 *
 * watchEffect(() => {
 *   // works for reactivity tracking
 *   console.log(copy.count)
 * })
 *
 * // mutating original will trigger watchers relying on the copy
 * original.count++
 *
 * // mutating the copy will fail and result in a warning
 * copy.count++ // warning!
 * \`\`\`
 *
 * @param target - The source object.
 * @see {@link https://vuejs.org/api/reactivity-core.html#readonly}
 */
export declare function readonly<T extends object>(target: T): DeepReadonly<UnwrapNestedRefs<T>>;
/**
 * Shallow version of {@link readonly}.
 *
 * Unlike {@link readonly}, there is no deep conversion: only root-level
 * properties are made readonly. Property values are stored and exposed as-is -
 * this also means properties with ref values will not be automatically
 * unwrapped.
 *
 * @example
 * \`\`\`js
 * const state = shallowReadonly({
 *   foo: 1,
 *   nested: {
 *     bar: 2
 *   }
 * })
 *
 * // mutating state's own properties will fail
 * state.foo++
 *
 * // ...but works on nested objects
 * isReadonly(state.nested) // false
 *
 * // works
 * state.nested.bar++
 * \`\`\`
 *
 * @param target - The source object.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#shallowreadonly}
 */
export declare function shallowReadonly<T extends object>(target: T): Readonly<T>;
/**
 * Checks if an object is a proxy created by {@link reactive} or
 * {@link shallowReactive} (or {@link ref} in some cases).
 *
 * @example
 * \`\`\`js
 * isReactive(reactive({}))            // => true
 * isReactive(readonly(reactive({})))  // => true
 * isReactive(ref({}).value)           // => true
 * isReactive(readonly(ref({})).value) // => true
 * isReactive(ref(true))               // => false
 * isReactive(shallowRef({}).value)    // => false
 * isReactive(shallowReactive({}))     // => true
 * \`\`\`
 *
 * @param value - The value to check.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#isreactive}
 */
export declare function isReactive(value: unknown): boolean;
/**
 * Checks whether the passed value is a readonly object. The properties of a
 * readonly object can change, but they can't be assigned directly via the
 * passed object.
 *
 * The proxies created by {@link readonly} and {@link shallowReadonly} are
 * both considered readonly, as is a computed ref without a set function.
 *
 * @param value - The value to check.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#isreadonly}
 */
export declare function isReadonly(value: unknown): boolean;
export declare function isShallow(value: unknown): boolean;
/**
 * Checks if an object is a proxy created by {@link reactive},
 * {@link readonly}, {@link shallowReactive} or {@link shallowReadonly}.
 *
 * @param value - The value to check.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#isproxy}
 */
export declare function isProxy(value: any): boolean;
/**
 * Returns the raw, original object of a Vue-created proxy.
 *
 * \`toRaw()\` can return the original object from proxies created by
 * {@link reactive}, {@link readonly}, {@link shallowReactive} or
 * {@link shallowReadonly}.
 *
 * This is an escape hatch that can be used to temporarily read without
 * incurring proxy access / tracking overhead or write without triggering
 * changes. It is **not** recommended to hold a persistent reference to the
 * original object. Use with caution.
 *
 * @example
 * \`\`\`js
 * const foo = {}
 * const reactiveFoo = reactive(foo)
 *
 * console.log(toRaw(reactiveFoo) === foo) // true
 * \`\`\`
 *
 * @param observed - The object for which the "raw" value is requested.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#toraw}
 */
export declare function toRaw<T>(observed: T): T;
export type Raw<T> = T & {
    [RawSymbol]?: true;
};
/**
 * Marks an object so that it will never be converted to a proxy. Returns the
 * object itself.
 *
 * @example
 * \`\`\`js
 * const foo = markRaw({})
 * console.log(isReactive(reactive(foo))) // false
 *
 * // also works when nested inside other reactive objects
 * const bar = reactive({ foo })
 * console.log(isReactive(bar.foo)) // false
 * \`\`\`
 *
 * **Warning:** \`markRaw()\` together with the shallow APIs such as
 * {@link shallowReactive} allow you to selectively opt-out of the default
 * deep reactive/readonly conversion and embed raw, non-proxied objects in your
 * state graph.
 *
 * @param value - The object to be marked as "raw".
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#markraw}
 */
export declare function markRaw<T extends object>(value: T): Raw<T>;
/**
 * Returns a reactive proxy of the given value (if possible).
 *
 * If the given value is not an object, the original value itself is returned.
 *
 * @param value - The value for which a reactive proxy shall be created.
 */
export declare const toReactive: <T extends unknown>(value: T) => T;
/**
 * Returns a readonly proxy of the given value (if possible).
 *
 * If the given value is not an object, the original value itself is returned.
 *
 * @param value - The value for which a readonly proxy shall be created.
 */
export declare const toReadonly: <T extends unknown>(value: T) => DeepReadonly<T>;

export type EffectScheduler = (...args: any[]) => any;
export type DebuggerEvent = {
    effect: Subscriber;
} & DebuggerEventExtraInfo;
export type DebuggerEventExtraInfo = {
    target: object;
    type: TrackOpTypes | TriggerOpTypes;
    key: any;
    newValue?: any;
    oldValue?: any;
    oldTarget?: Map<any, any> | Set<any>;
};
export interface DebuggerOptions {
    onTrack?: (event: DebuggerEvent) => void;
    onTrigger?: (event: DebuggerEvent) => void;
}
export interface ReactiveEffectOptions extends DebuggerOptions {
    scheduler?: EffectScheduler;
    allowRecurse?: boolean;
    onStop?: () => void;
}
export interface ReactiveEffectRunner<T = any> {
    (): T;
    effect: ReactiveEffect;
}
export declare enum EffectFlags {
    /**
     * ReactiveEffect only
     */
    ACTIVE = 1,
    RUNNING = 2,
    TRACKING = 4,
    NOTIFIED = 8,
    DIRTY = 16,
    ALLOW_RECURSE = 32,
    PAUSED = 64,
    EVALUATED = 128
}
/**
 * Subscriber is a type that tracks (or subscribes to) a list of deps.
 */
interface Subscriber extends DebuggerOptions {
}
export declare class ReactiveEffect<T = any> implements Subscriber, ReactiveEffectOptions {
    fn: () => T;
    scheduler?: EffectScheduler;
    onStop?: () => void;
    onTrack?: (event: DebuggerEvent) => void;
    onTrigger?: (event: DebuggerEvent) => void;
    constructor(fn: () => T);
    pause(): void;
    resume(): void;
    run(): T;
    stop(): void;
    trigger(): void;
    get dirty(): boolean;
}
export declare function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions): ReactiveEffectRunner<T>;
/**
 * Stops the effect associated with the given runner.
 *
 * @param runner - Association with the effect to stop tracking.
 */
export declare function stop(runner: ReactiveEffectRunner): void;
/**
 * Temporarily pauses tracking.
 */
export declare function pauseTracking(): void;
/**
 * Re-enables effect tracking (if it was paused).
 */
export declare function enableTracking(): void;
/**
 * Resets the previous global effect tracking state.
 */
export declare function resetTracking(): void;
/**
 * Registers a cleanup function for the current active effect.
 * The cleanup function is called right before the next effect run, or when the
 * effect is stopped.
 *
 * Throws a warning if there is no current active effect. The warning can be
 * suppressed by passing \`true\` to the second argument.
 *
 * @param fn - the cleanup function to be registered
 * @param failSilently - if \`true\`, will not throw warning when called without
 * an active effect.
 */
export declare function onEffectCleanup(fn: () => void, failSilently?: boolean): void;

declare const ComputedRefSymbol: unique symbol;
declare const WritableComputedRefSymbol: unique symbol;
interface BaseComputedRef<T, S = T> extends Ref<T, S> {
    [ComputedRefSymbol]: true;
    /**
     * @deprecated computed no longer uses effect
     */
    effect: ComputedRefImpl;
}
export interface ComputedRef<T = any> extends BaseComputedRef<T> {
    readonly value: T;
}
export interface WritableComputedRef<T, S = T> extends BaseComputedRef<T, S> {
    [WritableComputedRefSymbol]: true;
}
export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;
export interface WritableComputedOptions<T, S = T> {
    get: ComputedGetter<T>;
    set: ComputedSetter<S>;
}
/**
 * @private exported by @vue/reactivity for Vue core use, but not exported from
 * the main vue package
 */
export declare class ComputedRefImpl<T = any> implements Subscriber {
    fn: ComputedGetter<T>;
    private readonly setter;
    effect: this;
    onTrack?: (event: DebuggerEvent) => void;
    onTrigger?: (event: DebuggerEvent) => void;
    constructor(fn: ComputedGetter<T>, setter: ComputedSetter<T> | undefined, isSSR: boolean);
    get value(): T;
    set value(newValue: T);
}
/**
 * Takes a getter function and returns a readonly reactive ref object for the
 * returned value from the getter. It can also take an object with get and set
 * functions to create a writable ref object.
 *
 * @example
 * \`\`\`js
 * // Creating a readonly computed ref:
 * const count = ref(1)
 * const plusOne = computed(() => count.value + 1)
 *
 * console.log(plusOne.value) // 2
 * plusOne.value++ // error
 * \`\`\`
 *
 * \`\`\`js
 * // Creating a writable computed ref:
 * const count = ref(1)
 * const plusOne = computed({
 *   get: () => count.value + 1,
 *   set: (val) => {
 *     count.value = val - 1
 *   }
 * })
 *
 * plusOne.value = 1
 * console.log(count.value) // 0
 * \`\`\`
 *
 * @param getter - Function that produces the next value.
 * @param debugOptions - For debugging. See {@link https://vuejs.org/guide/extras/reactivity-in-depth.html#computed-debugging}.
 * @see {@link https://vuejs.org/api/reactivity-core.html#computed}
 */
export declare function computed<T>(getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): ComputedRef<T>;
export declare function computed<T, S = T>(options: WritableComputedOptions<T, S>, debugOptions?: DebuggerOptions): WritableComputedRef<T, S>;

declare const RefSymbol: unique symbol;
declare const RawSymbol: unique symbol;
export interface Ref<T = any, S = T> {
    get value(): T;
    set value(_: S);
    /**
     * Type differentiator only.
     * We need this to be in public d.ts but don't want it to show up in IDE
     * autocomplete, so we use a private Symbol instead.
     */
    [RefSymbol]: true;
}
/**
 * Checks if a value is a ref object.
 *
 * @param r - The value to inspect.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#isref}
 */
export declare function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
/**
 * Takes an inner value and returns a reactive and mutable ref object, which
 * has a single property \`.value\` that points to the inner value.
 *
 * @param value - The object to wrap in the ref.
 * @see {@link https://vuejs.org/api/reactivity-core.html#ref}
 */
export declare function ref<T>(value: T): [T] extends [Ref] ? IfAny<T, Ref<T>, T> : Ref<UnwrapRef<T>, UnwrapRef<T> | T>;
export declare function ref<T = any>(): Ref<T | undefined>;
declare const ShallowRefMarker: unique symbol;
export type ShallowRef<T = any, S = T> = Ref<T, S> & {
    [ShallowRefMarker]?: true;
};
/**
 * Shallow version of {@link ref}.
 *
 * @example
 * \`\`\`js
 * const state = shallowRef({ count: 1 })
 *
 * // does NOT trigger change
 * state.value.count = 2
 *
 * // does trigger change
 * state.value = { count: 2 }
 * \`\`\`
 *
 * @param value - The "inner value" for the shallow ref.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#shallowref}
 */
export declare function shallowRef<T>(value: T): Ref extends T ? T extends Ref ? IfAny<T, ShallowRef<T>, T> : ShallowRef<T> : ShallowRef<T>;
export declare function shallowRef<T = any>(): ShallowRef<T | undefined>;
/**
 * Force trigger effects that depends on a shallow ref. This is typically used
 * after making deep mutations to the inner value of a shallow ref.
 *
 * @example
 * \`\`\`js
 * const shallow = shallowRef({
 *   greet: 'Hello, world'
 * })
 *
 * // Logs "Hello, world" once for the first run-through
 * watchEffect(() => {
 *   console.log(shallow.value.greet)
 * })
 *
 * // This won't trigger the effect because the ref is shallow
 * shallow.value.greet = 'Hello, universe'
 *
 * // Logs "Hello, universe"
 * triggerRef(shallow)
 * \`\`\`
 *
 * @param ref - The ref whose tied effects shall be executed.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#triggerref}
 */
export declare function triggerRef(ref: Ref): void;
export type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>;
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);
/**
 * Returns the inner value if the argument is a ref, otherwise return the
 * argument itself. This is a sugar function for
 * \`val = isRef(val) ? val.value : val\`.
 *
 * @example
 * \`\`\`js
 * function useFoo(x: number | Ref<number>) {
 *   const unwrapped = unref(x)
 *   // unwrapped is guaranteed to be number now
 * }
 * \`\`\`
 *
 * @param ref - Ref or plain value to be converted into the plain value.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#unref}
 */
export declare function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T;
/**
 * Normalizes values / refs / getters to values.
 * This is similar to {@link unref}, except that it also normalizes getters.
 * If the argument is a getter, it will be invoked and its return value will
 * be returned.
 *
 * @example
 * \`\`\`js
 * toValue(1) // 1
 * toValue(ref(1)) // 1
 * toValue(() => 1) // 1
 * \`\`\`
 *
 * @param source - A getter, an existing ref, or a non-function value.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#tovalue}
 */
export declare function toValue<T>(source: MaybeRefOrGetter<T>): T;
/**
 * Returns a proxy for the given object that shallowly unwraps properties that
 * are refs. If the object already is reactive, it's returned as-is. If not, a
 * new reactive proxy is created.
 *
 * @param objectWithRefs - Either an already-reactive object or a simple object
 * that contains refs.
 */
export declare function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T>;
export type CustomRefFactory<T> = (track: () => void, trigger: () => void) => {
    get: () => T;
    set: (value: T) => void;
};
/**
 * Creates a customized ref with explicit control over its dependency tracking
 * and updates triggering.
 *
 * @param factory - The function that receives the \`track\` and \`trigger\` callbacks.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#customref}
 */
export declare function customRef<T>(factory: CustomRefFactory<T>): Ref<T>;
export type ToRefs<T = any> = {
    [K in keyof T]: ToRef<T[K]>;
};
/**
 * Converts a reactive object to a plain object where each property of the
 * resulting object is a ref pointing to the corresponding property of the
 * original object. Each individual ref is created using {@link toRef}.
 *
 * @param object - Reactive object to be made into an object of linked refs.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#torefs}
 */
export declare function toRefs<T extends object>(object: T): ToRefs<T>;
export type ToRef<T> = IfAny<T, Ref<T>, [T] extends [Ref] ? T : Ref<T>>;
/**
 * Used to normalize values / refs / getters into refs.
 *
 * @example
 * \`\`\`js
 * // returns existing refs as-is
 * toRef(existingRef)
 *
 * // creates a ref that calls the getter on .value access
 * toRef(() => props.foo)
 *
 * // creates normal refs from non-function values
 * // equivalent to ref(1)
 * toRef(1)
 * \`\`\`
 *
 * Can also be used to create a ref for a property on a source reactive object.
 * The created ref is synced with its source property: mutating the source
 * property will update the ref, and vice-versa.
 *
 * @example
 * \`\`\`js
 * const state = reactive({
 *   foo: 1,
 *   bar: 2
 * })
 *
 * const fooRef = toRef(state, 'foo')
 *
 * // mutating the ref updates the original
 * fooRef.value++
 * console.log(state.foo) // 2
 *
 * // mutating the original also updates the ref
 * state.foo++
 * console.log(fooRef.value) // 3
 * \`\`\`
 *
 * @param source - A getter, an existing ref, a non-function value, or a
 *                 reactive object to create a property ref from.
 * @param [key] - (optional) Name of the property in the reactive object.
 * @see {@link https://vuejs.org/api/reactivity-utilities.html#toref}
 */
export declare function toRef<T>(value: T): T extends () => infer R ? Readonly<Ref<R>> : T extends Ref ? T : Ref<UnwrapRef<T>>;
export declare function toRef<T extends object, K extends keyof T>(object: T, key: K): ToRef<T[K]>;
export declare function toRef<T extends object, K extends keyof T>(object: T, key: K, defaultValue: T[K]): ToRef<Exclude<T[K], undefined>>;
/**
 * This is a special exported interface for other packages to declare
 * additional types that should bail out for ref unwrapping. For example
 * \@vue/runtime-dom can declare it like so in its d.ts:
 *
 * \`\`\` ts
 * declare module '@vue/reactivity' {
 *   export interface RefUnwrapBailTypes {
 *     runtimeDOMBailTypes: Node | Window
 *   }
 * }
 * \`\`\`
 */
export interface RefUnwrapBailTypes {
}
export type ShallowUnwrapRef<T> = {
    [K in keyof T]: DistributeRef<T[K]>;
};
type DistributeRef<T> = T extends Ref<infer V, unknown> ? V : T;
export type UnwrapRef<T> = T extends ShallowRef<infer V, unknown> ? V : T extends Ref<infer V, unknown> ? UnwrapRefSimple<V> : UnwrapRefSimple<T>;
type UnwrapRefSimple<T> = T extends Builtin | Ref | RefUnwrapBailTypes[keyof RefUnwrapBailTypes] | {
    [RawSymbol]?: true;
} ? T : T extends Map<infer K, infer V> ? Map<K, UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof Map<any, any>>> : T extends WeakMap<infer K, infer V> ? WeakMap<K, UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof WeakMap<any, any>>> : T extends Set<infer V> ? Set<UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof Set<any>>> : T extends WeakSet<infer V> ? WeakSet<UnwrapRefSimple<V>> & UnwrapRef<Omit<T, keyof WeakSet<any>>> : T extends ReadonlyArray<any> ? {
    [K in keyof T]: UnwrapRefSimple<T[K]>;
} : T extends object & {
    [ShallowReactiveMarker]?: never;
} ? {
    [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>;
} : T;

export declare const ITERATE_KEY: unique symbol;
export declare const MAP_KEY_ITERATE_KEY: unique symbol;
export declare const ARRAY_ITERATE_KEY: unique symbol;
/**
 * Tracks access to a reactive property.
 *
 * This will check which effect is running at the moment and record it as dep
 * which records all effects that depend on the reactive property.
 *
 * @param target - Object holding the reactive property.
 * @param type - Defines the type of access to the reactive property.
 * @param key - Identifier of the reactive property to track.
 */
export declare function track(target: object, type: TrackOpTypes, key: unknown): void;
/**
 * Finds all deps associated with the target (or a specific property) and
 * triggers the effects stored within.
 *
 * @param target - The reactive object.
 * @param type - Defines the type of the operation that needs to trigger effects.
 * @param key - Can be used to target a specific reactive property in the target object.
 */
export declare function trigger(target: object, type: TriggerOpTypes, key?: unknown, newValue?: unknown, oldValue?: unknown, oldTarget?: Map<unknown, unknown> | Set<unknown>): void;

export declare class EffectScope {
    detached: boolean;
    private _isPaused;
    constructor(detached?: boolean);
    get active(): boolean;
    pause(): void;
    /**
     * Resumes the effect scope, including all child scopes and effects.
     */
    resume(): void;
    run<T>(fn: () => T): T | undefined;
    prevScope: EffectScope | undefined;
    stop(fromParent?: boolean): void;
}
/**
 * Creates an effect scope object which can capture the reactive effects (i.e.
 * computed and watchers) created within it so that these effects can be
 * disposed together. For detailed use cases of this API, please consult its
 * corresponding {@link https://github.com/vuejs/rfcs/blob/master/active-rfcs/0041-reactivity-effect-scope.md | RFC}.
 *
 * @param detached - Can be used to create a "detached" effect scope.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#effectscope}
 */
export declare function effectScope(detached?: boolean): EffectScope;
/**
 * Returns the current active effect scope if there is one.
 *
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#getcurrentscope}
 */
export declare function getCurrentScope(): EffectScope | undefined;
/**
 * Registers a dispose callback on the current active effect scope. The
 * callback will be invoked when the associated effect scope is stopped.
 *
 * @param fn - The callback function to attach to the scope's cleanup.
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#onscopedispose}
 */
export declare function onScopeDispose(fn: () => void, failSilently?: boolean): void;

/**
 * Track array iteration and return:
 * - if input is reactive: a cloned raw array with reactive values
 * - if input is non-reactive or shallowReactive: the original raw array
 */
export declare function reactiveReadArray<T>(array: T[]): T[];
/**
 * Track array iteration and return raw array
 */
export declare function shallowReadArray<T>(arr: T[]): T[];

export declare enum WatchErrorCodes {
    WATCH_GETTER = 2,
    WATCH_CALLBACK = 3,
    WATCH_CLEANUP = 4
}
export type WatchEffect = (onCleanup: OnCleanup) => void;
export type WatchSource<T = any> = Ref<T, any> | ComputedRef<T> | (() => T);
export type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV, onCleanup: OnCleanup) => any;
export type OnCleanup = (cleanupFn: () => void) => void;
export interface WatchOptions<Immediate = boolean> extends DebuggerOptions {
    immediate?: Immediate;
    deep?: boolean | number;
    once?: boolean;
    scheduler?: WatchScheduler;
    onWarn?: (msg: string, ...args: any[]) => void;
}
export type WatchStopHandle = () => void;
export interface WatchHandle extends WatchStopHandle {
    pause: () => void;
    resume: () => void;
    stop: () => void;
}
export type WatchScheduler = (job: () => void, isFirstRun: boolean) => void;
/**
 * Returns the current active effect if there is one.
 */
export declare function getCurrentWatcher(): ReactiveEffect<any> | undefined;
/**
 * Registers a cleanup callback on the current active effect. This
 * registered cleanup callback will be invoked right before the
 * associated effect re-runs.
 *
 * @param cleanupFn - The callback function to attach to the effect's cleanup.
 * @param failSilently - if \`true\`, will not throw warning when called without
 * an active effect.
 * @param owner - The effect that this cleanup function should be attached to.
 * By default, the current active effect.
 */
export declare function onWatcherCleanup(cleanupFn: () => void, failSilently?: boolean, owner?: ReactiveEffect | undefined): void;
export declare function watch(source: WatchSource | WatchSource[] | WatchEffect | object, cb?: WatchCallback | null, options?: WatchOptions): WatchHandle;
export declare function traverse(value: unknown, depth?: number, seen?: Map<unknown, number>): unknown;


`);

vueDtsMap.set('file:///node_modules/@vue/shared/index.d.ts', `/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export declare function makeMap(str: string): (key: string) => boolean;

export declare const EMPTY_OBJ: {
    readonly [key: string]: any;
};
export declare const EMPTY_ARR: readonly never[];
export declare const NOOP: () => void;
/**
 * Always return false.
 */
export declare const NO: () => boolean;
export declare const isOn: (key: string) => boolean;
export declare const isModelListener: (key: string) => key is \`onUpdate:\${string}\`;
export declare const extend: typeof Object.assign;
export declare const remove: <T>(arr: T[], el: T) => void;
export declare const hasOwn: (val: object, key: string | symbol) => key is keyof typeof val;
export declare const isArray: typeof Array.isArray;
export declare const isMap: (val: unknown) => val is Map<any, any>;
export declare const isSet: (val: unknown) => val is Set<any>;
export declare const isDate: (val: unknown) => val is Date;
export declare const isRegExp: (val: unknown) => val is RegExp;
export declare const isFunction: (val: unknown) => val is Function;
export declare const isString: (val: unknown) => val is string;
export declare const isSymbol: (val: unknown) => val is symbol;
export declare const isObject: (val: unknown) => val is Record<any, any>;
export declare const isPromise: <T = any>(val: unknown) => val is Promise<T>;
export declare const objectToString: typeof Object.prototype.toString;
export declare const toTypeString: (value: unknown) => string;
export declare const toRawType: (value: unknown) => string;
export declare const isPlainObject: (val: unknown) => val is object;
export declare const isIntegerKey: (key: unknown) => boolean;
export declare const isReservedProp: (key: string) => boolean;
export declare const isBuiltInDirective: (key: string) => boolean;
/**
 * @private
 */
export declare const camelize: (str: string) => string;
/**
 * @private
 */
export declare const hyphenate: (str: string) => string;
/**
 * @private
 */
export declare const capitalize: <T extends string>(str: T) => Capitalize<T>;
/**
 * @private
 */
export declare const toHandlerKey: <T extends string>(str: T) => T extends '' ? '' : \`on\${Capitalize<T>}\`;
export declare const hasChanged: (value: any, oldValue: any) => boolean;
export declare const invokeArrayFns: (fns: Function[], ...arg: any[]) => void;
export declare const def: (obj: object, key: string | symbol, value: any, writable?: boolean) => void;
/**
 * "123-foo" will be parsed to 123
 * This is used for the .number modifier in v-model
 */
export declare const looseToNumber: (val: any) => any;
/**
 * Only concerns number-like strings
 * "123-foo" will be returned as-is
 */
export declare const toNumber: (val: any) => any;
export declare const getGlobalThis: () => any;
export declare function genPropsAccessExp(name: string): string;
export declare function genCacheKey(source: string, options: any): string;

/**
 * Patch flags are optimization hints generated by the compiler.
 * when a block with dynamicChildren is encountered during diff, the algorithm
 * enters "optimized mode". In this mode, we know that the vdom is produced by
 * a render function generated by the compiler, so the algorithm only needs to
 * handle updates explicitly marked by these patch flags.
 *
 * Patch flags can be combined using the | bitwise operator and can be checked
 * using the & operator, e.g.
 *
 * \`\`\`js
 * const flag = TEXT | CLASS
 * if (flag & TEXT) { ... }
 * \`\`\`
 *
 * Check the \`patchElement\` function in '../../runtime-core/src/renderer.ts' to see how the
 * flags are handled during diff.
 */
export declare enum PatchFlags {
    /**
     * Indicates an element with dynamic textContent (children fast path)
     */
    TEXT = 1,
    /**
     * Indicates an element with dynamic class binding.
     */
    CLASS = 2,
    /**
     * Indicates an element with dynamic style
     * The compiler pre-compiles static string styles into static objects
     * + detects and hoists inline static objects
     * e.g. \`style="color: red"\` and \`:style="{ color: 'red' }"\` both get hoisted
     * as:
     * \`\`\`js
     * const style = { color: 'red' }
     * render() { return e('div', { style }) }
     * \`\`\`
     */
    STYLE = 4,
    /**
     * Indicates an element that has non-class/style dynamic props.
     * Can also be on a component that has any dynamic props (includes
     * class/style). when this flag is present, the vnode also has a dynamicProps
     * array that contains the keys of the props that may change so the runtime
     * can diff them faster (without having to worry about removed props)
     */
    PROPS = 8,
    /**
     * Indicates an element with props with dynamic keys. When keys change, a full
     * diff is always needed to remove the old key. This flag is mutually
     * exclusive with CLASS, STYLE and PROPS.
     */
    FULL_PROPS = 16,
    /**
     * Indicates an element that requires props hydration
     * (but not necessarily patching)
     * e.g. event listeners & v-bind with prop modifier
     */
    NEED_HYDRATION = 32,
    /**
     * Indicates a fragment whose children order doesn't change.
     */
    STABLE_FRAGMENT = 64,
    /**
     * Indicates a fragment with keyed or partially keyed children
     */
    KEYED_FRAGMENT = 128,
    /**
     * Indicates a fragment with unkeyed children.
     */
    UNKEYED_FRAGMENT = 256,
    /**
     * Indicates an element that only needs non-props patching, e.g. ref or
     * directives (onVnodeXXX hooks). since every patched vnode checks for refs
     * and onVnodeXXX hooks, it simply marks the vnode so that a parent block
     * will track it.
     */
    NEED_PATCH = 512,
    /**
     * Indicates a component with dynamic slots (e.g. slot that references a v-for
     * iterated value, or dynamic slot names).
     * Components with this flag are always force updated.
     */
    DYNAMIC_SLOTS = 1024,
    /**
     * Indicates a fragment that was created only because the user has placed
     * comments at the root level of a template. This is a dev-only flag since
     * comments are stripped in production.
     */
    DEV_ROOT_FRAGMENT = 2048,
    /**
     * SPECIAL FLAGS -------------------------------------------------------------
     * Special flags are negative integers. They are never matched against using
     * bitwise operators (bitwise matching should only happen in branches where
     * patchFlag > 0), and are mutually exclusive. When checking for a special
     * flag, simply check patchFlag === FLAG.
     */
    /**
     * Indicates a cached static vnode. This is also a hint for hydration to skip
     * the entire sub tree since static content never needs to be updated.
     */
    CACHED = -1,
    /**
     * A special flag that indicates that the diffing algorithm should bail out
     * of optimized mode. For example, on block fragments created by renderSlot()
     * when encountering non-compiler generated slots (i.e. manually written
     * render functions, which should always be fully diffed)
     * OR manually cloneVNodes
     */
    BAIL = -2
}
/**
 * dev only flag -> name mapping
 */
export declare const PatchFlagNames: Record<PatchFlags, string>;

export declare enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 2,
    STATEFUL_COMPONENT = 4,
    TEXT_CHILDREN = 8,
    ARRAY_CHILDREN = 16,
    SLOTS_CHILDREN = 32,
    TELEPORT = 64,
    SUSPENSE = 128,
    COMPONENT_SHOULD_KEEP_ALIVE = 256,
    COMPONENT_KEPT_ALIVE = 512,
    COMPONENT = 6
}

export declare enum SlotFlags {
    /**
     * Stable slots that only reference slot props or context state. The slot
     * can fully capture its own dependencies so when passed down the parent won't
     * need to force the child to update.
     */
    STABLE = 1,
    /**
     * Slots that reference scope variables (v-for or an outer slot prop), or
     * has conditional structure (v-if, v-for). The parent will need to force
     * the child to update because the slot does not fully capture its dependencies.
     */
    DYNAMIC = 2,
    /**
     * \`<slot/>\` being forwarded into a child component. Whether the parent needs
     * to update the child is dependent on what kind of slots the parent itself
     * received. This has to be refined at runtime, when the child's vnode
     * is being created (in \`normalizeChildren\`)
     */
    FORWARDED = 3
}
/**
 * Dev only
 */
export declare const slotFlagsText: Record<SlotFlags, string>;

export declare const isGloballyAllowed: (key: string) => boolean;
/** @deprecated use \`isGloballyAllowed\` instead */
export declare const isGloballyWhitelisted: (key: string) => boolean;

export declare function generateCodeFrame(source: string, start?: number, end?: number): string;

export type NormalizedStyle = Record<string, string | number>;
export declare function normalizeStyle(value: unknown): NormalizedStyle | string | undefined;
export declare function parseStringStyle(cssText: string): NormalizedStyle;
export declare function stringifyStyle(styles: NormalizedStyle | string | undefined): string;
export declare function normalizeClass(value: unknown): string;
export declare function normalizeProps(props: Record<string, any> | null): Record<string, any> | null;

/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind \`__DEV__\` flag.
 */
export declare const isHTMLTag: (key: string) => boolean;
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind \`__DEV__\` flag.
 */
export declare const isSVGTag: (key: string) => boolean;
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind \`__DEV__\` flag.
 */
export declare const isMathMLTag: (key: string) => boolean;
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind \`__DEV__\` flag.
 */
export declare const isVoidTag: (key: string) => boolean;

export declare const isSpecialBooleanAttr: (key: string) => boolean;
/**
 * The full list is needed during SSR to produce the correct initial markup.
 */
export declare const isBooleanAttr: (key: string) => boolean;
/**
 * Boolean attributes should be included if the value is truthy or ''.
 * e.g. \`<select multiple>\` compiles to \`{ multiple: '' }\`
 */
export declare function includeBooleanAttr(value: unknown): boolean;
export declare function isSSRSafeAttrName(name: string): boolean;
export declare const propsToAttrMap: Record<string, string | undefined>;
/**
 * Known attributes, this is used for stringification of runtime static nodes
 * so that we don't stringify bindings that cannot be set from HTML.
 * Don't also forget to allow \`data-*\` and \`aria-*\`!
 * Generated from https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
 */
export declare const isKnownHtmlAttr: (key: string) => boolean;
/**
 * Generated from https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
 */
export declare const isKnownSvgAttr: (key: string) => boolean;
/**
 * Generated from https://developer.mozilla.org/en-US/docs/Web/MathML/Attribute
 */
export declare const isKnownMathMLAttr: (key: string) => boolean;
/**
 * Shared between server-renderer and runtime-core hydration logic
 */
export declare function isRenderableAttrValue(value: unknown): boolean;

export declare function escapeHtml(string: unknown): string;
export declare function escapeHtmlComment(src: string): string;
export declare const cssVarNameEscapeSymbolsRE: RegExp;
export declare function getEscapedCssVarName(key: string, doubleEscape: boolean): string;

export declare function looseEqual(a: any, b: any): boolean;
export declare function looseIndexOf(arr: any[], val: any): number;

/**
 * For converting {{ interpolation }} values to displayed strings.
 * @private
 */
export declare const toDisplayString: (val: unknown) => string;

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type LooseRequired<T> = {
    [P in keyof (T & Required<T>)]: T[P];
};
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsKeyValues<T, K = string> = IfAny<T, false, T extends object ? (keyof T extends K ? true : false) : false>;
/**
 * Utility for extracting the parameters from a function overload (for typed emits)
 * https://github.com/microsoft/TypeScript/issues/32164#issuecomment-1146737709
 */
export type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;
type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;
type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (...args: infer TArgs) => infer TReturn ? TPartialOverload extends TOverload ? never : OverloadUnionRecursive<TPartialOverload & TOverload, TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>> | ((...args: TArgs) => TReturn) : never;
type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<OverloadUnionRecursive<(() => never) & TOverload>, TOverload extends () => never ? never : () => never>;

/**
 * Normalize CSS var value created by \`v-bind\` in \`<style>\` block
 * See https://github.com/vuejs/core/pull/12461#issuecomment-2495804664
 */
export declare function normalizeCssVarValue(value: unknown): string;


`);

