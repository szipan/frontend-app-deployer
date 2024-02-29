# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### FrontendAppDeployer <a name="FrontendAppDeployer" id="frontend-app-deployer.FrontendAppDeployer"></a>

#### Initializers <a name="Initializers" id="frontend-app-deployer.FrontendAppDeployer.Initializer"></a>

```typescript
import { FrontendAppDeployer } from 'frontend-app-deployer'

new FrontendAppDeployer(scope: Construct, id: string, props?: FrontendAppDeployerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.props">props</a></code> | <code><a href="#frontend-app-deployer.FrontendAppDeployerProps">FrontendAppDeployerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="frontend-app-deployer.FrontendAppDeployer.Initializer.parameter.props"></a>

- *Type:* <a href="#frontend-app-deployer.FrontendAppDeployerProps">FrontendAppDeployerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="frontend-app-deployer.FrontendAppDeployer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="frontend-app-deployer.FrontendAppDeployer.isConstruct"></a>

```typescript
import { FrontendAppDeployer } from 'frontend-app-deployer'

FrontendAppDeployer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="frontend-app-deployer.FrontendAppDeployer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#frontend-app-deployer.FrontendAppDeployer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="frontend-app-deployer.FrontendAppDeployer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### FrontendAppDeployerProps <a name="FrontendAppDeployerProps" id="frontend-app-deployer.FrontendAppDeployerProps"></a>

#### Initializer <a name="Initializer" id="frontend-app-deployer.FrontendAppDeployerProps.Initializer"></a>

```typescript
import { FrontendAppDeployerProps } from 'frontend-app-deployer'

const frontendAppDeployerProps: FrontendAppDeployerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.assetPath">assetPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.baseImageForBuilding">baseImageForBuilding</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.buildScript">buildScript</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.domainName">domainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.hostedZoneId">hostedZoneId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.hostedZoneName">hostedZoneName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.iamCertificateId">iamCertificateId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.recordName">recordName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.targetToCNRegions">targetToCNRegions</a></code> | <code>boolean</code> | Indicate whether to create stack in CN regions. |
| <code><a href="#frontend-app-deployer.FrontendAppDeployerProps.property.useCustomDomainName">useCustomDomainName</a></code> | <code>boolean</code> | Whether to use custom domain name. |

---

##### `assetPath`<sup>Required</sup> <a name="assetPath" id="frontend-app-deployer.FrontendAppDeployerProps.property.assetPath"></a>

```typescript
public readonly assetPath: string;
```

- *Type:* string

---

##### `baseImageForBuilding`<sup>Required</sup> <a name="baseImageForBuilding" id="frontend-app-deployer.FrontendAppDeployerProps.property.baseImageForBuilding"></a>

```typescript
public readonly baseImageForBuilding: string;
```

- *Type:* string

---

##### `buildScript`<sup>Required</sup> <a name="buildScript" id="frontend-app-deployer.FrontendAppDeployerProps.property.buildScript"></a>

```typescript
public readonly buildScript: string;
```

- *Type:* string

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="frontend-app-deployer.FrontendAppDeployerProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

---

##### `hostedZoneId`<sup>Optional</sup> <a name="hostedZoneId" id="frontend-app-deployer.FrontendAppDeployerProps.property.hostedZoneId"></a>

```typescript
public readonly hostedZoneId: string;
```

- *Type:* string

---

##### `hostedZoneName`<sup>Optional</sup> <a name="hostedZoneName" id="frontend-app-deployer.FrontendAppDeployerProps.property.hostedZoneName"></a>

```typescript
public readonly hostedZoneName: string;
```

- *Type:* string

---

##### `iamCertificateId`<sup>Optional</sup> <a name="iamCertificateId" id="frontend-app-deployer.FrontendAppDeployerProps.property.iamCertificateId"></a>

```typescript
public readonly iamCertificateId: string;
```

- *Type:* string

---

##### `recordName`<sup>Optional</sup> <a name="recordName" id="frontend-app-deployer.FrontendAppDeployerProps.property.recordName"></a>

```typescript
public readonly recordName: string;
```

- *Type:* string

---

##### `targetToCNRegions`<sup>Optional</sup> <a name="targetToCNRegions" id="frontend-app-deployer.FrontendAppDeployerProps.property.targetToCNRegions"></a>

```typescript
public readonly targetToCNRegions: boolean;
```

- *Type:* boolean
- *Default:* false.

Indicate whether to create stack in CN regions.

---

##### `useCustomDomainName`<sup>Optional</sup> <a name="useCustomDomainName" id="frontend-app-deployer.FrontendAppDeployerProps.property.useCustomDomainName"></a>

```typescript
public readonly useCustomDomainName: boolean;
```

- *Type:* boolean

Whether to use custom domain name.

---



